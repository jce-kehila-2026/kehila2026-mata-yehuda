export const NOTIFICATION_COMPLIANCE_NOTE =
    "הודעות נשלחות רק למשתתפים שנרשמו לקבלת עדכונים.";

export const NOTIFICATION_BACKEND_ERROR_NAME = "NotificationBackendUnavailable";

/** @deprecated Use getNotificationBackendRequiredMessage() for context-aware text. */
export const NOTIFICATION_BACKEND_REQUIRED_MESSAGE =
    "שליחת הודעות דורשת חיבור לשרת ההודעות. ודאו שהשרת רץ: cd server && npm start";

export function getNotificationBackendRequiredMessage(apiBase = "") {
    const normalizedBase = String(apiBase || "").trim();

    if (import.meta.env.DEV && !normalizedBase) {
        return NOTIFICATION_BACKEND_REQUIRED_MESSAGE;
    }

    if (normalizedBase) {
        return `לא ניתן להתחבר לשרת ההודעות (${normalizedBase}). בדקו שהשירות פעיל וזמין.`;
    }

    return (
        "שליחת הודעות דורשת הגדרת VITE_NOTIFICATIONS_API_URL על שירות ה-frontend ב-Render, " +
        "ואז פריסה מחדש (Manual Deploy) כדי שהערך ייכלל בבנייה."
    );
}

export const NOTIFICATION_NO_ACTIVE_DEVICES_MESSAGE =
    "אין מכשירים פעילים לשליחת הודעות. יש לבקש מהמשתתפים לאשר הודעות בדפדפן.";

export const NOTIFICATION_TARGET_GROUPS = [
    { value: "all", label: "כל המשתתפים" },
    { value: "day_center", label: "מרכז יום" },
    { value: "60_plus", label: "60+ / 60-" },
    { value: "supportive_community", label: "קהילה תומכת" }
];

export function getNotificationTargetGroupLabel(value) {
    const group = NOTIFICATION_TARGET_GROUPS.find((item) => item.value === value);
    return group?.label || value || "—";
}

export function validateNotificationMessage({ title, body }) {
    if (!body?.trim()) {
        return "יש להזין תוכן הודעה";
    }

    if (!title?.trim()) {
        return "יש להזין כותרת הודעה";
    }

    return "";
}

export function formatNotificationSummary({
    successCount,
    failureCount,
    totalTokens
}) {
    return `נשלחו ${successCount} מתוך ${totalTokens}\nנכשלו ${failureCount}`;
}
