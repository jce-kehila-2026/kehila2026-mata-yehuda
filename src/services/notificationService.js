import { auth } from "../config/firebase";
import {
    NOTIFICATION_BACKEND_REQUIRED_MESSAGE
} from "../components/messages/helpers/messageHelpers";

function getNotificationsApiBase() {
    return import.meta.env.VITE_NOTIFICATIONS_API_URL?.trim().replace(/\/$/, "") || "";
}

function getNotificationsSendUrl() {
    const base = getNotificationsApiBase();
    return base ? `${base}/api/notifications/send` : "/api/notifications/send";
}

function getNotificationsHealthUrl() {
    const base = getNotificationsApiBase();
    return base ? `${base}/health` : "/health";
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

async function assertNotificationBackendAvailable() {
    try {
        const response = await fetch(getNotificationsHealthUrl(), {
            method: "GET",
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(NOTIFICATION_BACKEND_REQUIRED_MESSAGE);
        }

        const data = await response.json().catch(() => ({}));

        if (data.ok !== true) {
            throw new Error(NOTIFICATION_BACKEND_REQUIRED_MESSAGE);
        }
    } catch (error) {
        if (error.message === NOTIFICATION_BACKEND_REQUIRED_MESSAGE) {
            throw error;
        }

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
