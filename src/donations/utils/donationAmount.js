const ZERO_DONATION_ERROR = "לא ניתן לתרום 0 שקלים";
const MISSING_DONATION_ERROR = "אנא בחרו סכום תרומה";
const INVALID_DONATION_ERROR = "סכום תרומה לא תקין";

function parseDonationAmountValue(selectedAmount, customAmount) {
  if (customAmount !== "") {
    const parsed = Number(customAmount);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return Math.round(parsed * 100) / 100;
  }

  if (typeof selectedAmount === "number" && Number.isFinite(selectedAmount)) {
    return selectedAmount;
  }

  return null;
}

export function getDonationAmountValidation(selectedAmount, customAmount) {
  const hasCustomInput = customAmount !== "";
  const hasPresetSelection = typeof selectedAmount === "number";
  const choseOtherWithoutInput =
    selectedAmount === "other" && !hasCustomInput;

  if (!hasCustomInput && !hasPresetSelection) {
    return { amount: null, error: MISSING_DONATION_ERROR };
  }

  if (choseOtherWithoutInput) {
    return { amount: null, error: MISSING_DONATION_ERROR };
  }

  const amount = parseDonationAmountValue(selectedAmount, customAmount);

  if (amount === 0) {
    return { amount: null, error: ZERO_DONATION_ERROR };
  }

  if (amount != null && amount < 0) {
    return { amount: null, error: INVALID_DONATION_ERROR };
  }

  if (amount != null && amount > 0) {
    return { amount, error: null };
  }

  return { amount: null, error: INVALID_DONATION_ERROR };
}

export function resolveDonationAmount(selectedAmount, customAmount) {
  return getDonationAmountValidation(selectedAmount, customAmount).amount;
}

export function getDonationAmountServerError(rawAmount) {
  const parsed = Number(rawAmount);
  if (Number.isFinite(parsed) && parsed === 0) {
    return ZERO_DONATION_ERROR;
  }
  return INVALID_DONATION_ERROR;
}
