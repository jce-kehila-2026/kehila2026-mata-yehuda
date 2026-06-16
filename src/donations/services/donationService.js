import { apiPost } from "../../services/Payment/api.js";

/** Donation endpoints live on the same payment server (matayehuda-payment-api). */
export async function createDonationPayPalOrder(amount) {
  return apiPost("/donations/create-paypal-order", { amount });
}

export async function captureDonationPayPalOrder(payload) {
  return apiPost("/donations/capture-paypal-order", payload);
}

export async function saveDonationCashPayment(payload) {
  return apiPost("/donations/save-cash-payment", payload);
}

export async function saveDonationBitPayment(payload) {
  return apiPost("/donations/save-bit-payment", payload);
}
