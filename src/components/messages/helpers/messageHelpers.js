export const NOTIFICATION_COMPLIANCE_NOTE =
    "התראות נשלחות רק למשתתפים שנרשמו לקבלת עדכונים.";

export const NOTIFICATION_BACKEND_REQUIRED_MESSAGE =
    "שליחת התראות דורשת חיבור לשרת ההתראות";

export const NOTIFICATION_TARGET_GROUPS = [
    { value: "all", label: "כל המשתתפים" },
    { value: "day_center", label: "מוקד יום" },
    { value: "60_plus", label: "60+ / 60-" },
    { value: "supportive_community", label: "קהילה תומכת" }
];

export function getNotificationTargetGroupLabel(value) {
    const group = NOTIFICATION_TARGET_GROUPS.find((item) => item.value === value);
    return group?.label || value || "—";
}

export function validateNotificationMessage({ title, body }) {
    if (!body?.trim()) {
        return "יש להזין תוכן התראה";
    }

    if (!title?.trim()) {
        return "יש להזין כותרת התראה";
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
