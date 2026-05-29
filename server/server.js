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

// =========================
// Get PayPal Access Token
// =========================

async function generateAccessToken() {
  try {
    const auth = Buffer.from(
      process.env.PAYPAL_CLIENT_ID +
        ":" +
        process.env.PAYPAL_CLIENT_SECRET
    ).toString("base64");

    const response = await fetch(
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

    return data.access_token;
  } catch (error) {
    console.error(error);
  }
}

// =========================
// Create PayPal Order
// =========================

app.post("/create-paypal-order", async (req, res) => {
  try {
    const accessToken = await generateAccessToken();

    const response = await fetch(
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
                currency_code: "USD",
                value: "50.00",
              },
            },
          ],
application_context: {
  return_url: "http://localhost:5173/payment-success",
  cancel_url: "http://localhost:5173/payment-cancel",
  user_action: "PAY_NOW",
},
        }),
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
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
  const response = await fetch(
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
  lastName,
  phone,
  paymentMethod,
  amount,
  transactionId,
  status,
}) {
  const existing = await findPaymentByPaypalOrderId(orderID);

  if (existing) {
    return existing.paymentId;
  }

  const paymentRef = await db.collection("payments").add({
    firstName,
    lastName,
    phone,
    paymentMethod: paymentMethod || "PayPal",
    amount,
    paypalOrderId: orderID,
    transactionId,
    status,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return paymentRef.id;
}

// =========================
// Capture PayPal Order + Save Payment
// =========================

app.post("/capture-paypal-order", async (req, res) => {
  console.log("capture route hit");
  try {
    const {
      orderID,
      firstName,
      lastName,
      phone,
      paymentMethod,
      amount,
    } = req.body;

    if (!orderID) {
      return res.status(400).json({
        success: false,
        message: "Missing PayPal order ID",
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

    const accessToken = await generateAccessToken();

    const response = await fetch(
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
    console.log(data);

    if (data.status === "COMPLETED") {
      const transactionId =
        data.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      const paymentId = await savePayPalPayment({
        orderID,
        firstName,
        lastName,
        phone,
        paymentMethod,
        amount,
        transactionId,
        status: data.status,
      });

      return res.json({
        success: true,
        message: "Payment completed and saved",
        transactionId,
        paymentId,
      });
    }

    if (isOrderAlreadyCapturedError(data)) {
      const order = await getPayPalOrder(orderID, accessToken);

      if (order.status === "COMPLETED") {
        const transactionId =
          order.purchase_units?.[0]?.payments?.captures?.[0]?.id;

        const paymentId = await savePayPalPayment({
          orderID,
          firstName,
          lastName,
          phone,
          paymentMethod,
          amount,
          transactionId,
          status: order.status,
        });

        return res.json({
          success: true,
          message: "Payment already captured",
          transactionId,
          paymentId,
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
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

app.post("/save-cash-payment", async (req, res) => {
  try {
    const { firstName, lastName, phone, paymentMethod, amount } = req.body;

    const paymentRef = await db.collection("payments").add({
      firstName,
      lastName,
      phone,
      paymentMethod: paymentMethod || "cash",
      amount,
      status: "PENDING_CASH_PAYMENT",
      message: "Seat reserved. Waiting for cash payment.",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: "Cash reservation saved",
      paymentId: paymentRef.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save cash payment",
    });
  }
}); 

app.post("/save-bit-payment", async (req, res) => {

  try {

    const {
      firstName,
      lastName,
      phone,
      paymentMethod,
      amount,
    } = req.body;

    const paymentRef = await db.collection("payments").add({

      firstName,
      lastName,
      phone,

      paymentMethod: paymentMethod || "bit",

      amount,

      status: "WAITING_FOR_BIT_PAYMENT",

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),

    });

    res.json({
      success: true,
      paymentId: paymentRef.id,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
    });
  }
});

// =========================
// Find active registration (for cancel button recovery)
// =========================

app.post("/find-active-registration", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "חסר מספר טלפון",
      });
    }

    const snapshot = await db
      .collection("payments")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({
        success: false,
        message: "לא נמצאה הרשמה פעילה",
      });
    }

    const doc = snapshot.docs[0];

    res.json({
      success: true,
      paymentId: doc.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "שגיאה בחיפוש הרשמה",
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
  const lastName = paymentData.lastName || "";

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    phone: paymentData.phone || "",

    amount: paymentData.amount ?? null,
    currency: "USD",
    paymentMethod: paymentData.paymentMethod || "",
    paymentMethodLabel: paymentMethodLabel(paymentData.paymentMethod),
    paymentStatus: paymentData.status || "",

    originalPaymentId: paymentId,
    paypalOrderId: paymentData.paypalOrderId || null,
    transactionId: paymentData.transactionId || null,

    cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    refundStatus,
    refundNoteForStaff: refundNoteForStaff(refundStatus),
    refundResult: refundResult || null,
  };
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
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
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

      const refundResponse = await fetch(
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

    await db.collection("cancellations").add(
      buildCancellationRecord(paymentData, paymentId, refundStatus, refundResult)
    );

    await paymentRef.delete();

    let message = "ההרשמה בוטלה בהצלחה.";

    if (refundStatus === "AUTOMATIC_REFUNDED") {
      message =
        "ההרשמה בוטלה. התשלום יוחזר אוטומטית לחשבון PayPal או כרטיס האשראי שלך.";
    } else if (refundStatus === "MANUAL_REFUND_REQUIRED") {
      message =
        "ההרשמה בוטלה. אם שילמת במזומן או ב-Bit, העמותה תחזיר לך את התשלום.";
    }

    res.json({
      success: true,
      refundStatus,
      message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "שגיאה בביטול ההרשמה",
    });
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