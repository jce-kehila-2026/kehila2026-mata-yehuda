export const DONATION_PRESET_AMOUNTS = [50, 100, 150, 200];

export const DONATION_PAYMENT_METHODS = [
  { value: "credit card", label: "כרטיס אשראי" },
  { value: "paypal", label: "PayPal" },
  { value: "bit", label: "Bit" },
  { value: "cash", label: "מזומן" },
];

export const DONATION_STORAGE_KEYS = {
  amount: "donationAmount",
  firstName: "donationFirstName",
  phone: "donationPhone",
  paymentMethod: "donationPaymentMethod",
  donationId: "donationId",
};
