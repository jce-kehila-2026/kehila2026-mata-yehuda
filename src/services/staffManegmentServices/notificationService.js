import { auth } from "../../config/firebase";
import {
    NOTIFICATION_BACKEND_REQUIRED_MESSAGE
} from "../../components/messages/helpers/messageHelpers";

const LOCAL_NOTIFICATION_SERVER_PATTERN =
    /^https?:\/\/(localhost|127\.0\.0\.1):3001\/?$/i;

function getConfiguredNotificationsApiBase() {
    return import.meta.env.VITE_NOTIFICATIONS_API_URL?.trim().replace(/\/$/, "") || "";
}

function getNotificationsApiBase() {
    const configured = getConfiguredNotificationsApiBase();

    if (
        import.meta.env.DEV &&
        (!configured || LOCAL_NOTIFICATION_SERVER_PATTERN.test(configured))
    ) {
        return "";
    }

    return configured;
}

function getNotificationsSendUrl() {
    const base = getNotificationsApiBase();
    return base ? `${base}/api/notifications/send` : "/api/notifications/send";
}

function getNotificationsHealthUrl() {
    const base = getNotificationsApiBase();
    return base ? `${base}/health` : "/health";
}

export function getNotificationBackendUrls() {
    const configured = getConfiguredNotificationsApiBase();
    const apiBase = getNotificationsApiBase();

    return {
        configuredApiBase: configured || "(not set)",
        resolvedApiBase: apiBase || "(vite dev proxy → http://127.0.0.1:3001)",
        healthUrl: getNotificationsHealthUrl(),
        sendUrl: getNotificationsSendUrl(),
        mode: import.meta.env.DEV ? "development" : "production"
    };
}

function mapNotificationApiError(response, data) {
    if (response.status === 401 || data?.error === "UNAUTHORIZED") {
        return "NOT_AUTHENTICATED";
    }

    if (response.status === 400 && data?.error === "MESSAGE_BODY_REQUIRED") {
        return "יש להזין תוכן התראה";
    }

    if (response.status === 503) {
        return (
            data?.message ||
            "שרת ההתראות לא מוגדר. הפעל את שרת השליחה והגדר משתני סביבה."
        );
    }

    return data?.message || NOTIFICATION_BACKEND_REQUIRED_MESSAGE;
}

export async function checkNotificationBackendHealth() {
    const urls = getNotificationBackendUrls();

    console.info("[notifications] Checking backend health", urls);

    try {
        const response = await fetch(urls.healthUrl, {
            method: "GET",
            signal: AbortSignal.timeout(5000)
        });
        const data = await response.json().catch(() => ({}));
        const ok = response.ok && data.ok === true;
        const result = {
            ...urls,
            status: response.status,
            ok,
            firebaseConfigured: Boolean(data.firebaseConfigured)
        };

        console.info("[notifications] Health check result", result);

        return result;
    } catch (error) {
        console.error("[notifications] Health check failed", {
            ...urls,
            error: error.message
        });

        return {
            ...urls,
            ok: false,
            status: 0,
            error: error.message
        };
    }
}

async function assertNotificationBackendAvailable() {
    const health = await checkNotificationBackendHealth();

    if (!health.ok) {
        throw new Error(NOTIFICATION_BACKEND_REQUIRED_MESSAGE);
    }
}

export async function sendPushNotification({
    title,
    body,
    targetGroup = "all"
}) {
    await assertNotificationBackendAvailable();

    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("NOT_AUTHENTICATED");
    }

    const idToken = await currentUser.getIdToken();

    let response;

    try {
        response = await fetch(getNotificationsSendUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`
            },
            body: JSON.stringify({
                targetGroup,
                title: title?.trim() || "מטה יהודה",
                body: body?.trim() || ""
            })
        });
    } catch (error) {
        throw new Error(NOTIFICATION_BACKEND_REQUIRED_MESSAGE, { cause: error });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessage = mapNotificationApiError(response, data);
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }

    return {
        targetGroup: data.targetGroup || targetGroup,
        totalTokens: data.totalTokens ?? 0,
        successCount: data.successCount ?? 0,
        failureCount: data.failureCount ?? 0
    };
}
