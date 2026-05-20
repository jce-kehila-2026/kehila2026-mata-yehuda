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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

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

      await db.collection("payments").add({
        firstName,
        lastName,
        phone,
        paymentMethod: paymentMethod || "PayPal",
        amount,
        paypalOrderId: orderID,
        transactionId,
        status: data.status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        success: true,
        message: "Payment completed and saved",
        transactionId,
      });
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

    await db.collection("payments").add({
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

    await db.collection("payments").add({

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
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
    });
  }
});

app.listen(PORT,() => {
  console.log(`Server Running on http://localhost:${PORT}`)
});