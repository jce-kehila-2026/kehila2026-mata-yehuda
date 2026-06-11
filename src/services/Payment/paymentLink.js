/**
 * בונה נתיב פנימי לדף תשלום לפעילות.
 *
 * @param {string} activityId - מזהה המסמך ב-collection activities
 * @param {{ programId?: string }} [options]
 * @returns {string}
 */
export function buildActivityPaymentPath(activityId, options = {}) {
  if (!activityId) {
    return "/pay";
  }

  const params = new URLSearchParams({ activityId });

  if (options.programId) {
    params.set("programId", options.programId);
  }

  return `/pay?${params.toString()}`;
}

/**
 * בונה קישור מלא (URL) להרשמה ותשלום לפעילות ב-Firestore.
 *
 * @param {string} activityId - מזהה המסמך ב-collection activities (לא שם הפעילות)
 * @param {{ programId?: string, baseUrl?: string }} [options]
 * @returns {string}
 */
/**
 * נתיב לחזרה לתשלום אחרי כישלון PayPal/אשראי (לפי localStorage).
 */
export function getStoredRegistrationPaymentPath() {
  const activityId = localStorage.getItem("activityId");
  const programId = localStorage.getItem("programId") || "";

  if (activityId) {
    return buildActivityPaymentPath(activityId, { programId });
  }

  return "/pay";
}

export function buildActivityPaymentUrl(activityId, options = {}) {
  if (!activityId) {
    return "";
  }

  const baseUrl = (
    options.baseUrl ||
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/$/, "");

  return `${baseUrl}${buildActivityPaymentPath(activityId, options)}`;
}
