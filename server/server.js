import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import process from "process";
import { Buffer } from "buffer";
import admin from "firebase-admin";


dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const PORT = 5001;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();

const FIRESTORE_TIMEOUT_MS = 15000;
const PAYPAL_FETCH_TIMEOUT_MS = 20000;

function withTimeout(
  promise,
  ms = FIRESTORE_TIMEOUT_MS,
  errorMessage = "Firestore timeout"
) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), ms);
    }),
  ]);
}

async function fetchWithTimeout(url, options = {}, ms = PAYPAL_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function serverErrorMessage(error, fallback) {
  if (
    error?.message?.includes("timeout") ||
    error?.message?.includes("יותר מדי") ||
    error?.name === "AbortError" ||
    error?.code === 14
  ) {
    return "לא ניתן להתחבר למסד הנתונים. בדקו חיבור לאינטרנט ונסו שוב.";
  }
  return fallback;
}

// =========================
// Participants & registrations
// =========================

async function findParticipantByIdNumber(idNumber) {
  const trimmed = String(idNumber || "").trim();
  if (!trimmed) {
    return null;
  }

  const snapshot = await withTimeout(
    db
      .collection("participants")
      .where("id_number", "==", trimmed)
      .limit(1)
      .get(),
    FIRESTORE_TIMEOUT_MS,
    "Firestore participants lookup timeout"
  );

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, data: doc.data() };
}

async function findOrCreateParticipant({ firstName, idNumber, phone }) {
  const trimmedId = String(idNumber || "").trim();
  const existing = await findParticipantByIdNumber(trimmedId);

  if (existing) {
    await withTimeout(
      db
        .collection("participants")
        .doc(existing.id)
        .set(
          {
            first_name: firstName || existing.data.first_name || "",
            phone: phone || existing.data.phone || "",
          },
          { merge: true }
        ),
      FIRESTORE_TIMEOUT_MS,
      "Firestore participant update timeout"
    );
    return { id: existing.id, isNew: false };
  }

  const ref = await withTimeout(
    db.collection("participants").add({
      first_name: firstName || "",
      last_name: "",
      id_number: trimmedId,
      phone: phone || "",
      address: "",
      gender: "",
      emergency_number: "",
      medical_notes: "",
      mobility_limitations: "",
    }),
    FIRESTORE_TIMEOUT_MS,
    "Firestore participant create timeout"
  );

  return { id: ref.id, isNew: true };
}

function registrationStatusForPayment(paymentStatus) {
  const paid =
    paymentStatus === "COMPLETED" ||
    paymentStatus === "PAID" ||
    paymentStatus === "paid";
  return paid ? "registered" : "pending_payment";
}

async function createRegistrationRecord({
  participantId,
  activityId,
  programId,
  paymentMethod,
  paymentStatus,
  registrationStatus,
  paymentId,
  amount,
}) {
  const regRef = await withTimeout(
    db.collection("registrations").add({
      participant_id: participantId,
      activity_id: activityId || "",
      program_id: programId || "",
      payment_method: paymentMethod || "",
      payment_status: paymentStatus || "",
      registration_status:
        registrationStatus || registrationStatusForPayment(paymentStatus),
      registered_at: admin.firestore.FieldValue.serverTimestamp(),
      payment_id: paymentId || "",
      amount: amount ?? null,
    }),
    FIRESTORE_TIMEOUT_MS,
    "Firestore registration create timeout"
  );

  return regRef.id;
}

async function savePaymentWithRegistration({
  firstName,
  idNumber,
  phone,
  paymentMethod,
  amount,
  activityId,
  programId,
  status,
  currency,
  activityTitle,
  extraFields = {},
}) {
  await assertNoDuplicateRegistration(idNumber, activityId);

  const participant = await findOrCreateParticipant({
    firstName,
    idNumber,
    phone,
  });

  const paymentRef = db.collection("payments").doc();
  const registrationStatus = registrationStatusForPayment(status);

  const paymentPayload = {
    firstName,
    idNumber,
    phone,
    participantId: participant.id,
    activityId: activityId || null,
    activityTitle: activityTitle || null,
    programId: programId || null,
    paymentMethod,
    amount,
    currency: currency || "ILS",
    status,
    ...extraFields,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  let spotReserved = false;
  let registrationId;

  try {
    if (activityId) {
      await incrementActivityParticipants(activityId);
      spotReserved = true;
    }

    registrationId = await createRegistrationRecord({
      participantId: participant.id,
      activityId,
      programId,
      paymentMethod,
      paymentStatus: status,
      registrationStatus,
      paymentId: paymentRef.id,
      amount,
    });

    paymentPayload.registrationId = registrationId;

    await withTimeout(
      paymentRef.set(paymentPayload),
      FIRESTORE_TIMEOUT_MS,
      "Firestore payment create timeout"
    );

    return {
      paymentId: paymentRef.id,
      registrationId,
      participantId: participant.id,
      isNewParticipant: participant.isNew,
    };
  } catch (error) {
    if (spotReserved && activityId) {
      try {
        await decrementActivityParticipants(activityId);
      } catch (rollbackError) {
        console.error("Failed to rollback participant count:", rollbackError);
      }
    }
    throw error;
  }
}

async function markRegistrationCancelled(paymentData, paymentId) {
  const updates = {
    registration_status: "cancelled",
    payment_status: "cancelled",
    cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  const registrationId = paymentData.registrationId;

  if (registrationId) {
    await withTimeout(
      db.collection("registrations").doc(registrationId).update(updates),
      FIRESTORE_TIMEOUT_MS,
      "Firestore registration cancel timeout"
    );
    return;
  }

  const snapshot = await withTimeout(
    db
      .collection("registrations")
      .where("payment_id", "==", paymentId)
      .limit(1)
      .get(),
    FIRESTORE_TIMEOUT_MS,
    "Firestore registration lookup timeout"
  );

  if (!snapshot.empty) {
    await withTimeout(
      snapshot.docs[0].ref.update(updates),
      FIRESTORE_TIMEOUT_MS,
      "Firestore registration cancel timeout"
    );
  }
}

const DUPLICATE_REGISTRATION_MESSAGE = "כבר נרשמת לפעילות הזו";

function pickAllActivePayments(docs) {
  const active = docs.filter((doc) => {
    const status = (doc.data().status || "").toLowerCase();
    return status !== "cancelled";
  });

  active.sort((a, b) => {
    const aTime = a.data().createdAt?.toMillis?.() ?? 0;
    const bTime = b.data().createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });

  return active;
}

async function findActivePaymentForActivity(idNumber, activityId) {
  const trimmedId = String(idNumber || "").trim();
  const trimmedActivityId = String(activityId || "").trim();

  if (!trimmedId || !trimmedActivityId) {
    return null;
  }

  const snapshot = await withTimeout(
    db.collection("payments").where("idNumber", "==", trimmedId).get(),
    FIRESTORE_TIMEOUT_MS,
    "Firestore duplicate registration check timeout"
  );

  const active = pickAllActivePayments(snapshot.docs);
  return (
    active.find(
      (doc) => String(doc.data().activityId || "") === trimmedActivityId
    ) || null
  );
}

async function assertNoDuplicateRegistration(idNumber, activityId) {
  const existing = await findActivePaymentForActivity(idNumber, activityId);
  if (existing) {
    const error = new Error(DUPLICATE_REGISTRATION_MESSAGE);
    error.code = "DUPLICATE_REGISTRATION";
    throw error;
  }
}

function duplicateRegistrationResponse(res) {
  return res.status(409).json({
    success: false,
    message: DUPLICATE_REGISTRATION_MESSAGE,
  });
}

function mapPaymentToRegistrationSummary(doc) {
  const data = doc.data();
  return {
    paymentId: doc.id,
    registrationId: data.registrationId || null,
    participantId: data.participantId || null,
    activityTitle: data.activityTitle || "",
    activityId: data.activityId || "",
    paymentMethod: data.paymentMethod || "",
    amount: data.amount ?? null,
    currency: data.currency || "ILS",
    createdAt: data.createdAt?.toMillis?.() ?? null,
  };
}

// =========================
// Activities (price from Firestore document ID)
// =========================

function formatPayPalAmount(amount) {
  return Number(amount).toFixed(2);
}

function normalizeIdNumber(idNumber) {
  return String(idNumber || "").replace(/\D/g, "");
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function validateParticipantPayload({ firstName, idNumber, phone }) {
  const trimmedName = String(firstName || "").trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { valid: false, message: "אנא הזינו שם פרטי תקין" };
  }

  const digits = normalizeIdNumber(idNumber);
  if (!digits || digits.length !== 9) {
    return { valid: false, message: "מספר תעודת זהות חייב להיות בן 9 ספרות" };
  }

  const phoneDigits = normalizePhone(phone);
  if (!phoneDigits || phoneDigits.length !== 10 || !phoneDigits.startsWith("05")) {
    return { valid: false, message: "מספר הטלפון חייב להיות בן 10 ספרות ולהתחיל ב-05" };
  }

  return {
    valid: true,
    firstName: trimmedName,
    idNumber: digits,
    phone: phoneDigits,
  };
}

function getPayPalOrderAmount(orderData) {
  const unit = orderData?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const rawValue = capture?.amount?.value ?? unit?.amount?.value;
  const rawCurrency = capture?.amount?.currency_code ?? unit?.amount?.currency_code;

  return {
    value: Number(rawValue),
    currency: String(rawCurrency || "").toUpperCase(),
  };
}

function assertPayPalAmountMatchesActivity(activity, paypalAmount) {
  const expected = Number(activity.price);
  const received = Number(paypalAmount.value);

  if (!Number.isFinite(received) || Math.abs(received - expected) > 0.01) {
    const error = new Error("סכום התשלום לא תואם למחיר הפעילות");
    error.code = "PAYMENT_AMOUNT_MISMATCH";
    throw error;
  }

  const activityCurrency = String(activity.currency || "ILS").toUpperCase();
  const paidCurrency = String(paypalAmount.currency || activityCurrency).toUpperCase();

  if (paidCurrency !== activityCurrency) {
    const error = new Error("מטבע התשלום לא תואם לפעילות");
    error.code = "PAYMENT_CURRENCY_MISMATCH";
    throw error;
  }
}

const REGISTRATION_NOT_OPEN_MESSAGE = "עדיין לא נפתחה ההרשמה";
const REGISTRATION_CLOSED_MESSAGE = "תאריך ההרשמה לפעילות זו הסתיים";
const ACTIVITY_FULL_MESSAGE = "אין מקומות פנויים בפעילות זו";

function parseFirestoreTimestamp(value) {
  if (!value) {
    return null;
  }
  if (typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function isActivityOpenForRegistration(data) {
  if (data.is_open === true) {
    return true;
  }
  return (
    data.published === true ||
    String(data.status || "").toLowerCase() === "published"
  );
}

function getRegistrationBlockReason(data) {
  if (!isActivityOpenForRegistration(data)) {
    return {
      code: "REGISTRATION_NOT_OPEN",
      message: REGISTRATION_NOT_OPEN_MESSAGE,
    };
  }

  const deadline = parseFirestoreTimestamp(data.registration_deadline);
  if (deadline && Date.now() > deadline.getTime()) {
    return {
      code: "REGISTRATION_CLOSED",
      message: REGISTRATION_CLOSED_MESSAGE,
    };
  }

  const current = Number(data.current_participants) || 0;
  const max = Number(data.max_participants);
  if (Number.isFinite(max) && max > 0 && current >= max) {
    return {
      code: "ACTIVITY_FULL",
      message: ACTIVITY_FULL_MESSAGE,
    };
  }

  return null;
}

function assertActivityRegistrationAllowed(data) {
  const block = getRegistrationBlockReason(data);
  if (block) {
    const error = new Error(block.message);
    error.code = block.code;
    throw error;
  }
}

async function incrementActivityParticipants(activityId) {
  const ref = db.collection("activities").doc(activityId);

  await withTimeout(
    db.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists) {
        throw new Error("הפעילות לא נמצאה");
      }

      const data = snap.data();
      assertActivityRegistrationAllowed(data);

      const current = Number(data.current_participants) || 0;
      transaction.update(ref, { current_participants: current + 1 });
    }),
    FIRESTORE_TIMEOUT_MS,
    "Firestore activity participant increment timeout"
  );
}

async function decrementActivityParticipants(activityId) {
  if (!activityId) {
    return;
  }

  const ref = db.collection("activities").doc(activityId);

  await withTimeout(
    db.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists) {
        return;
      }

      const current = Number(snap.data().current_participants) || 0;
      transaction.update(ref, {
        current_participants: Math.max(0, current - 1),
      });
    }),
    FIRESTORE_TIMEOUT_MS,
    "Firestore activity participant decrement timeout"
  );
}

function isActivityRegistrationError(error) {
  return (
    error?.code === "REGISTRATION_NOT_OPEN" ||
    error?.code === "REGISTRATION_CLOSED" ||
    error?.code === "ACTIVITY_FULL"
  );
}

function parseActivityPricing(data) {
  const price = data.price ?? data.amount;
  if (price == null || Number(price) <= 0) {
    return null;
  }
  const description =
    data.description || data.shortDescription || data.summary || "";

  return {
    price: Number(price),
    currency: String(data.currency || "ILS").toUpperCase(),
    title: data.title || data.name || "פעילות",
    description: typeof description === "string" ? description.trim() : "",
  };
}

// activityDocId = Firestore document ID in activities/{id}
async function getActivityForPayment(activityDocId) {
  if (!activityDocId) {
    throw new Error("חסר מזהה פעילות");
  }

  const activityDoc = await withTimeout(
    db.collection("activities").doc(activityDocId).get(),
    FIRESTORE_TIMEOUT_MS,
    "Firestore activity lookup timeout"
  );

  if (!activityDoc.exists) {
    throw new Error("הפעילות לא נמצאה");
  }

  const data = activityDoc.data();

  assertActivityRegistrationAllowed(data);

  const pricing = parseActivityPricing(data);
  if (!pricing) {
    throw new Error("לפעילות זו לא הוגדר מחיר");
  }

  return {
    activityId: activityDoc.id,
    ...pricing,
  };
}

function activityErrorResponse(res, error, fallbackStatus = 400) {
  const message = error?.message || "שגיאה בטעינת הפעילות";
  const status = message.includes("לא נמצאה") ? 404 : fallbackStatus;
  return res.status(status).json({
    success: false,
    message,
    code: error?.code || undefined,
  });
}

function handlePaymentRouteError(res, error, fallbackMessage) {
  if (error.code === "DUPLICATE_REGISTRATION") {
    return duplicateRegistrationResponse(res);
  }
  if (isActivityRegistrationError(error)) {
    return activityErrorResponse(res, error);
  }
  if (error.message?.includes("פעילות") || error.message?.includes("מחיר")) {
    return activityErrorResponse(res, error);
  }
  return res.status(500).json({
    success: false,
    message: serverErrorMessage(error, fallbackMessage),
  });
}

app.get("/activities", async (req, res) => {
  try {
    const snapshot = await withTimeout(
      db.collection("activities").get(),
      FIRESTORE_TIMEOUT_MS,
      "Firestore activities list timeout"
    );

    const activities = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const pricing = parseActivityPricing(data);
        if (!pricing) {
          return null;
        }
        const block = getRegistrationBlockReason(data);
        return {
          activityId: doc.id,
          title: pricing.title,
          price: pricing.price,
          currency: pricing.currency,
          description: pricing.description,
          openForRegistration: !block,
          registrationBlockMessage: block?.message || null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title, "he"));

    res.json({ success: true, activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: serverErrorMessage(error, "שגיאה בטעינת רשימת הפעילויות"),
    });
  }
});

app.get("/activities/:activityId/payment-info", async (req, res) => {
  try {
    const activity = await getActivityForPayment(req.params.activityId);
    res.json({ success: true, ...activity });
  } catch (error) {
    console.error(error);
    activityErrorResponse(res, error);
  }
});

// =========================
// Get PayPal Access Token
// =========================

async function generateAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are not configured");
  }

  if (!process.env.PAYPAL_BASE_URL) {
    throw new Error("PAYPAL_BASE_URL is not configured");
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetchWithTimeout(
    `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error("PayPal token request failed:", data);
    throw new Error("Failed to obtain PayPal access token");
  }

  return data.access_token;
}

// =========================
// Create PayPal Order
// =========================

app.post("/create-paypal-order", async (req, res) => {
  try {
    const { activityId, idNumber } = req.body;

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "חסר מזהה פעילות",
      });
    }

    const activity = await getActivityForPayment(activityId);

    if (idNumber) {
      await assertNoDuplicateRegistration(idNumber, activity.activityId);
    }

    const accessToken = await generateAccessToken();

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const response = await fetchWithTimeout(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: activity.currency,
                value: formatPayPalAmount(activity.price),
              },
              description: activity.title,
            },
          ],
          application_context: {
            return_url: `${frontendUrl}/payment-success`,
            cancel_url: `${frontendUrl}/payment-cancel`,
            user_action: "PAY_NOW",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal create order failed:", data);
      return res.status(500).json({
        success: false,
        message: "יצירת הזמנת PayPal נכשלה",
      });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    return handlePaymentRouteError(res, error, "שגיאה ביצירת תשלום");
  }
});

// =========================
// PayPal / Firestore helpers
// =========================

async function findPaymentByPaypalOrderId(orderID) {
  const snapshot = await db
    .collection("payments")
    .where("paypalOrderId", "==", orderID)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { paymentId: doc.id, ...doc.data() };
}

async function getPayPalOrder(orderID, accessToken) {
  const response = await fetchWithTimeout(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.json();
}

function isOrderAlreadyCapturedError(data) {
  return data?.details?.some((d) => d.issue === "ORDER_ALREADY_CAPTURED");
}

async function savePayPalPayment({
  orderID,
  firstName,
  idNumber,
  phone,
  paymentMethod,
  amount,
  transactionId,
  status,
  activityId,
  programId,
  currency,
  activityTitle,
}) {
  const existing = await findPaymentByPaypalOrderId(orderID);

  if (existing) {
    return existing.paymentId;
  }

  const result = await savePaymentWithRegistration({
    firstName,
    idNumber,
    phone,
    paymentMethod: paymentMethod || "PayPal",
    amount,
    activityId,
    programId,
    currency,
    activityTitle,
    status,
    extraFields: {
      paypalOrderId: orderID,
      transactionId,
    },
  });

  return result.paymentId;
}

// =========================
// Capture PayPal Order + Save Payment
// =========================

app.post("/capture-paypal-order", async (req, res) => {
  try {
    const {
      orderID,
      firstName,
      idNumber,
      phone,
      paymentMethod,
      activityId,
      programId,
    } = req.body;

    if (!orderID) {
      return res.status(400).json({
        success: false,
        message: "Missing PayPal order ID",
      });
    }

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "חסר מזהה פעילות",
      });
    }

    const participantValidation = validateParticipantPayload({
      firstName,
      idNumber,
      phone,
    });
    if (!participantValidation.valid) {
      return res.status(400).json({
        success: false,
        message: participantValidation.message,
      });
    }

    const existingPayment = await findPaymentByPaypalOrderId(orderID);

    if (existingPayment) {
      return res.json({
        success: true,
        message: "Payment already saved",
        paymentId: existingPayment.paymentId,
        transactionId: existingPayment.transactionId,
      });
    }

    const activity = await getActivityForPayment(activityId);
    const accessToken = await generateAccessToken();

    const response = await fetchWithTimeout(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    const completeCapturedOrder = async (orderData) => {
      assertPayPalAmountMatchesActivity(activity, getPayPalOrderAmount(orderData));

      const transactionId =
        orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      const paymentId = await savePayPalPayment({
        orderID,
        firstName: participantValidation.firstName,
        idNumber: participantValidation.idNumber,
        phone: participantValidation.phone,
        paymentMethod,
        amount: activity.price,
        transactionId,
        status: orderData.status,
        activityId: activity.activityId,
        programId,
        currency: activity.currency,
        activityTitle: activity.title,
      });

      return {
        transactionId,
        paymentId,
      };
    };

    if (data.status === "COMPLETED") {
      const result = await completeCapturedOrder(data);

      return res.json({
        success: true,
        message: "Payment completed and saved",
        transactionId: result.transactionId,
        paymentId: result.paymentId,
      });
    }

    if (isOrderAlreadyCapturedError(data)) {
      const order = await getPayPalOrder(orderID, accessToken);

      if (order.status === "COMPLETED") {
        const result = await completeCapturedOrder(order);

        return res.json({
          success: true,
          message: "Payment already captured",
          transactionId: result.transactionId,
          paymentId: result.paymentId,
        });
      }
    }

    res.json({
      success: false,
      message: "Payment not completed",
      paypalStatus: data.status,
    });
  } catch (error) {
    console.error(error);
    if (
      error?.code === "PAYMENT_AMOUNT_MISMATCH" ||
      error?.code === "PAYMENT_CURRENCY_MISMATCH"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }
    return handlePaymentRouteError(res, error, "שגיאה באישור התשלום");
  }
});

app.post("/save-cash-payment", async (req, res) => {
  try {
    const {
      firstName,
      idNumber,
      phone,
      paymentMethod,
      activityId,
      programId,
    } = req.body;

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "חסר מזהה פעילות",
      });
    }

    const participantValidation = validateParticipantPayload({
      firstName,
      idNumber,
      phone,
    });
    if (!participantValidation.valid) {
      return res.status(400).json({
        success: false,
        message: participantValidation.message,
      });
    }

    const activity = await getActivityForPayment(activityId);

    const result = await savePaymentWithRegistration({
      firstName: participantValidation.firstName,
      idNumber: participantValidation.idNumber,
      phone: participantValidation.phone,
      paymentMethod: paymentMethod || "cash",
      amount: activity.price,
      activityId: activity.activityId,
      programId,
      currency: activity.currency,
      activityTitle: activity.title,
      status: "PENDING_CASH_PAYMENT",
      extraFields: {
        message: "Seat reserved. Waiting for cash payment.",
      },
    });

    res.json({
      success: true,
      message: "Cash reservation saved",
      paymentId: result.paymentId,
      registrationId: result.registrationId,
      participantId: result.participantId,
    });
  } catch (error) {
    console.error(error);
    return handlePaymentRouteError(res, error, "שגיאה בשמירת תשלום מזומן");
  }
}); 

app.post("/save-bit-payment", async (req, res) => {
  try {
    const {
      firstName,
      idNumber,
      phone,
      paymentMethod,
      activityId,
      programId,
    } = req.body;

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "חסר מזהה פעילות",
      });
    }

    const participantValidation = validateParticipantPayload({
      firstName,
      idNumber,
      phone,
    });
    if (!participantValidation.valid) {
      return res.status(400).json({
        success: false,
        message: participantValidation.message,
      });
    }

    const activity = await getActivityForPayment(activityId);

    const result = await savePaymentWithRegistration({
      firstName: participantValidation.firstName,
      idNumber: participantValidation.idNumber,
      phone: participantValidation.phone,
      paymentMethod: paymentMethod || "bit",
      amount: activity.price,
      activityId: activity.activityId,
      programId,
      currency: activity.currency,
      activityTitle: activity.title,
      status: "WAITING_FOR_BIT_PAYMENT",
    });

    res.json({
      success: true,
      paymentId: result.paymentId,
      registrationId: result.registrationId,
      participantId: result.participantId,
    });

  } catch (error) {
    console.error(error);
    return handlePaymentRouteError(res, error, "שגיאה בשמירת תשלום Bit");
  }
});

// =========================
// Check participant by ID (registration start)
// =========================

app.post("/check-participant", async (req, res) => {
  try {
    const idNumber = String(req.body.idNumber || "").trim();

    if (!idNumber) {
      return res.status(400).json({
        success: false,
        message: "חסר מספר תעודת זהות",
      });
    }

    const participant = await findParticipantByIdNumber(idNumber);

    if (!participant) {
      return res.json({
        success: true,
        exists: false,
      });
    }

    res.json({
      success: true,
      exists: true,
      participant: {
        firstName: participant.data.first_name || "",
        phone: participant.data.phone || "",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: serverErrorMessage(error, "שגיאה בבדיקת תעודת זהות"),
    });
  }
});

// =========================
// Find active registration (for cancel button recovery)
// =========================

app.post("/find-active-registration", async (req, res) => {
  try {
    const idNumber = String(req.body.idNumber || "").trim();

    if (!idNumber) {
      return res.status(400).json({
        success: false,
        message: "חסר מספר תעודת זהות",
      });
    }

    const snapshot = await withTimeout(
      db.collection("payments").where("idNumber", "==", idNumber).get(),
      FIRESTORE_TIMEOUT_MS,
      "Firestore search timeout"
    );

    if (snapshot.empty) {
      return res.json({
        success: false,
        message: "לא נמצאו הרשמות פעילות",
      });
    }

    const activeDocs = pickAllActivePayments(snapshot.docs);

    if (activeDocs.length === 0) {
      return res.json({
        success: false,
        message: "לא נמצאו הרשמות פעילות",
      });
    }

    const registrations = activeDocs.map(mapPaymentToRegistrationSummary);

    res.json({
      success: true,
      registrations,
      paymentId: registrations[0].paymentId,
      registrationId: registrations[0].registrationId,
      participantId: registrations[0].participantId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: serverErrorMessage(error, "שגיאה בחיפוש הרשמה"),
    });
  }
});

// =========================
// Cancel Registration
// =========================

function isPayPalPayment(paymentData) {
  const method = (paymentData.paymentMethod || "").toLowerCase();
  return (
    paymentData.status === "COMPLETED" ||
    method.includes("paypal") ||
    method.includes("credit card")
  );
}

function isManualRefundPayment(paymentData) {
  const method = (paymentData.paymentMethod || "").toLowerCase();
  return method === "cash" || method === "bit";
}

function getCancellationSuccessMessage(paymentData) {
  const method = (paymentData.paymentMethod || "").toLowerCase();

  if (method.includes("credit card")) {
    return "הביטול בוצע בהצלחה. הסכום יוחזר לכרטיס האשראי תוך 3 ימי עסקים.";
  }

  if (method.includes("paypal") || paymentData.status === "COMPLETED") {
    return "הביטול בוצע בהצלחה. הסכום יוחזר לחשבון PayPal שלך תוך 3 ימי עסקים.";
  }

  if (method === "cash" || method === "bit") {
    return "הביטול בוצע בהצלחה. מישהו מהעמותה ייצור איתכם קשר בקרוב להחזרת התשלום.";
  }

  return "הביטול בוצע בהצלחה.";
}

function paymentMethodLabel(method) {
  const m = (method || "").toLowerCase();
  if (m.includes("paypal") && m.includes("credit")) return "PayPal / כרטיס אשראי";
  if (m.includes("paypal")) return "PayPal";
  if (m.includes("credit")) return "כרטיס אשראי";
  if (m === "cash" || m.includes("מזומן")) return "מזומן";
  if (m === "bit") return "Bit";
  return method || "לא ידוע";
}

function refundNoteForStaff(refundStatus) {
  switch (refundStatus) {
    case "AUTOMATIC_REFUNDED":
      return "הוחזר אוטומטית דרך PayPal";
    case "MANUAL_REFUND_REQUIRED":
      return "יש להחזיר ידנית (מזומן / Bit)";
    default:
      return "לא נדרש החזר";
  }
}

function buildCancellationRecord(paymentData, paymentId, refundStatus, refundResult) {
  const firstName = paymentData.firstName || "";
  const idNumber = paymentData.idNumber || paymentData.lastName || "";

  return {
    firstName,
    idNumber,
    fullName: firstName,
    phone: paymentData.phone || "",

    amount: paymentData.amount ?? null,
    currency: paymentData.currency || "ILS",
    activityId: paymentData.activityId || null,
    activityTitle: paymentData.activityTitle || null,
    paymentMethod: paymentData.paymentMethod || "",
    paymentMethodLabel: paymentMethodLabel(paymentData.paymentMethod),
    paymentStatus: paymentData.status || "",

    originalPaymentId: paymentId,
    participantId: paymentData.participantId || null,
    registrationId: paymentData.registrationId || null,
    paypalOrderId: paymentData.paypalOrderId || null,
    transactionId: paymentData.transactionId || null,
    originalMessage: paymentData.message || null,
    registeredAt: paymentData.createdAt || null,

    cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    refundStatus,
    refundNoteForStaff: refundNoteForStaff(refundStatus),
    refundResult: refundResult || null,
  };
}

async function movePaymentToCancellations(
  paymentRef,
  paymentData,
  paymentId,
  refundStatus,
  refundResult
) {
  const cancellationRef = db.collection("cancellations").doc();
  const batch = db.batch();

  batch.set(
    cancellationRef,
    buildCancellationRecord(paymentData, paymentId, refundStatus, refundResult)
  );
  batch.delete(paymentRef);

  await withTimeout(
    batch.commit(),
    FIRESTORE_TIMEOUT_MS,
    "Firestore move to cancellations timeout"
  );

  return cancellationRef.id;
}

function verifyStaffAccess(req, res) {
  const pin = req.headers["x-staff-pin"];

  if (!process.env.STAFF_PIN) {
    res.status(500).json({
      success: false,
      message: "STAFF_PIN לא הוגדר בשרת",
    });
    return false;
  }

  if (pin !== process.env.STAFF_PIN) {
    res.status(401).json({
      success: false,
      message: "קוד גישה שגוי",
    });
    return false;
  }

  return true;
}

app.post("/cancel-registration", async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "חסר מזהה הרשמה",
      });
    }

    const paymentRef = db.collection("payments").doc(paymentId);
    const paymentDoc = await withTimeout(
      paymentRef.get(),
      FIRESTORE_TIMEOUT_MS,
      "Firestore get timeout"
    );

    if (!paymentDoc.exists) {
      const existingCancel = await withTimeout(
        db
          .collection("cancellations")
          .where("originalPaymentId", "==", paymentId)
          .limit(1)
          .get(),
        FIRESTORE_TIMEOUT_MS,
        "Firestore check cancellation timeout"
      );

      if (!existingCancel.empty) {
        const cancelled = existingCancel.docs[0].data();
        return res.json({
          success: true,
          alreadyCancelled: true,
          message: getCancellationSuccessMessage(cancelled),
          paymentMethod: cancelled.paymentMethod || "",
        });
      }

      return res.status(404).json({
        success: false,
        message: "ההרשמה לא נמצאה או כבר בוטלה",
      });
    }

    const paymentData = paymentDoc.data();
    let refundStatus = "NO_REFUND_NEEDED";
    let refundResult = null;

    if (isPayPalPayment(paymentData) && paymentData.transactionId) {
      const accessToken = await generateAccessToken();

      const refundResponse = await fetchWithTimeout(
        `${process.env.PAYPAL_BASE_URL}/v2/payments/captures/${paymentData.transactionId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        }
      );

      refundResult = await refundResponse.json();

      if (!refundResponse.ok) {
        console.error("PayPal refund failed:", refundResult);
        return res.status(500).json({
          success: false,
          message: "ביטול ההרשמה נכשל – לא ניתן להחזיר את התשלום ב-PayPal. אנא פנו לעמותה.",
        });
      }

      refundStatus = "AUTOMATIC_REFUNDED";
    } else if (isManualRefundPayment(paymentData)) {
      refundStatus = "MANUAL_REFUND_REQUIRED";
    }

    await markRegistrationCancelled(paymentData, paymentId);

    const cancellationId = await movePaymentToCancellations(
      paymentRef,
      paymentData,
      paymentId,
      refundStatus,
      refundResult
    );

    if (paymentData.activityId) {
      await decrementActivityParticipants(paymentData.activityId);
    }

    console.log(
      `Cancelled: payment ${paymentId} moved to cancellations/${cancellationId}`
    );

    const message = getCancellationSuccessMessage(paymentData);

    res.json({
      success: true,
      refundStatus,
      message,
      paymentMethod: paymentData.paymentMethod || "",
      movedToCancellations: true,
      cancellationId,
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: serverErrorMessage(error, "שגיאה בביטול ההרשמה"),
      });
    }
  }
});

// =========================
// Staff – view cancellations
// =========================

app.get("/staff/cancellations", async (req, res) => {
  try {
    if (!verifyStaffAccess(req, res)) {
      return;
    }

    const snapshot = await db
      .collection("cancellations")
      .orderBy("cancelledAt", "desc")
      .get();

    const cancellations = snapshot.docs.map((doc) => {
      const data = doc.data();
      const cancelledAt = data.cancelledAt?.toDate?.()
        ? data.cancelledAt.toDate().toISOString()
        : null;

      return {
        id: doc.id,
        ...data,
        cancelledAt,
      };
    });

    res.json({
      success: true,
      count: cancellations.length,
      cancellations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "שגיאה בטעינת ביטולים",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});