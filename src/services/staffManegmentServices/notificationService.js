import { auth } from "../../config/firebase";
import {
    getNotificationBackendRequiredMessage,
    NOTIFICATION_BACKEND_ERROR_NAME
} from "../../components/messages/helpers/messageHelpers";

const LOCAL_NOTIFICATION_SERVER_PATTERN =
    /^https?:\/\/(localhost|127\.0\.0\.1):3001\/?$/i;

function normalizeConfiguredApiBase(value) {
    return String(value ?? "")
        .trim()
        .replace(/^["']|["']$/g, "")
        .replace(/\/$/, "");
}

function getConfiguredNotificationsApiBase() {
    return normalizeConfiguredApiBase(import.meta.env.VITE_NOTIFICATIONS_API_URL);
}

function getNotificationsApiBase() {
    const configured = getConfiguredNotificationsApiBase();

    // Local dev: use Vite proxy unless a non-local remote URL is configured.
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

function createNotificationBackendError(cause) {
    const apiBase = getNotificationsApiBase();
    const error = new Error(getNotificationBackendRequiredMessage(apiBase));
    error.name = NOTIFICATION_BACKEND_ERROR_NAME;

    if (cause) {
        error.cause = cause;
    }

    return error;
}

function logNotificationsApiResolution() {
    const configured = getConfiguredNotificationsApiBase();
    const resolved = getNotificationsApiBase();

    console.log("[notifications] Resolved API base URL", {
        rawEnv: import.meta.env.VITE_NOTIFICATIONS_API_URL ?? "(undefined)",
        configuredApiBase: configured || "(not set)",
        resolvedApiBase:
            resolved ||
            (import.meta.env.DEV
                ? "(vite dev proxy → http://127.0.0.1:3001)"
                : "(not set — missing from production build)"),
        healthUrl: getNotificationsHealthUrl(),
        sendUrl: getNotificationsSendUrl(),
        mode: import.meta.env.MODE
    });
}

logNotificationsApiResolution();

export function getNotificationBackendUrls() {
    const configured = getConfiguredNotificationsApiBase();
    const apiBase = getNotificationsApiBase();

    return {
        configuredApiBase: configured || "(not set)",
        apiBase: apiBase || "",
        resolvedApiBase:
            apiBase ||
            (import.meta.env.DEV
                ? "(vite dev proxy → http://127.0.0.1:3001)"
                : "(not set — missing from production build)"),
        healthUrl: getNotificationsHealthUrl(),
        sendUrl: getNotificationsSendUrl(),
        usesRemoteApi: Boolean(apiBase),
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

    return (
        data?.message ||
        getNotificationBackendRequiredMessage(getNotificationsApiBase())
    );
}

export async function checkNotificationBackendHealth() {
    const urls = getNotificationBackendUrls();

    console.info("[notifications] Checking backend health", urls);

    if (!import.meta.env.DEV && !getNotificationsApiBase()) {
        const result = {
            ...urls,
            ok: false,
            status: 0,
            missingBuildEnv: true,
            error:
                "VITE_NOTIFICATIONS_API_URL is not present in the production build"
        };

        console.warn("[notifications] Health check skipped", result);

        return result;
    }

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
        throw createNotificationBackendError();
    }
}

export async function sendPushNotification({
    title,
    body,
    targetGroup = "all"
}) {
    await assertNotificationBackendAvailable();

    const currentUser = auth.currentUser;

    console.log("[notifications/auth] currentUser exists:", Boolean(currentUser));
    if (currentUser) {
        console.log("[notifications/auth] currentUser.uid:", currentUser.uid);
    }

    if (!currentUser) {
        throw new Error("NOT_AUTHENTICATED");
    }

    const idToken = await currentUser.getIdToken(true);

    console.log("[notifications/auth] ID token generated:", Boolean(idToken), {
        tokenLength: idToken?.length ?? 0
    });

    const requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
    };

    console.log("[notifications/auth] Authorization header included:", Boolean(requestHeaders.Authorization));

    let response;

    try {
        response = await fetch(getNotificationsSendUrl(), {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify({
                targetGroup,
                title: title?.trim() || "מטה יהודה",
                body: body?.trim() || ""
            })
        });
    } catch (error) {
        throw createNotificationBackendError(error);
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
