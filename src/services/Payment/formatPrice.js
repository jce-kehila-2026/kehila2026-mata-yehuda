export function formatDisplayPrice(amount, currency = "ILS") {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return "";
  }

  if (currency === "USD") {
    return `$${value}`;
  }

  return `₪${value}`;
}

export function formatActivityPrice(amount, currency = "ILS") {
  if (amount == null || amount === "") {
    return "חינם";
  }

  const value = Number(amount);

  if (Number.isFinite(value) && value === 0) {
    return "חינם";
  }

  return formatDisplayPrice(amount, currency);
}
