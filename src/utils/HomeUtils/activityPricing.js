export function resolveActivityPricingFromData(data) {
  const description =
    data?.description || data?.shortDescription || data?.summary || "";
  const base = {
    currency: String(data?.currency || "ILS").toUpperCase(),
    title: data?.title || data?.name || "פעילות",
    description: typeof description === "string" ? description.trim() : "",
  };

  const rawPrice = data?.price ?? data?.amount;
  if (rawPrice == null || rawPrice === "") {
    return {
      ...base,
      price: 0,
      isFree: true,
    };
  }

  const normalized =
    typeof rawPrice === "string" ? rawPrice.trim() : rawPrice;

  if (normalized === "") {
    return {
      ...base,
      price: 0,
      isFree: true,
    };
  }

  const price = Number(normalized);
  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return {
    ...base,
    price,
    isFree: price === 0,
  };
}

export function isActivityPricingErrorMessage(message = "") {
  return /מחיר|לא הוגדר/i.test(String(message));
}

export function buildPaymentInfoFromActivity(activity, activityId, programId = "") {
  const pricing = resolveActivityPricingFromData(activity);
  if (!pricing) {
    return null;
  }

  return {
    activityId: activityId || activity?.id || "",
    title: pricing.title,
    price: pricing.price,
    isFree: pricing.isFree,
    currency: pricing.currency,
    description: pricing.description,
    programId:
      activity?.program_id || activity?.programId || programId || "",
  };
}

export function isFreeActivityData(data) {
  return Boolean(resolveActivityPricingFromData(data)?.isFree);
}
