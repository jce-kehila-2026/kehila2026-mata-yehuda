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
