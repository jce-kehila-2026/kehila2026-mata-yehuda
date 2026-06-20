const LOG_PREFIX = "[fcm]";

export const FCM_OPTIONAL = true;

export const FIREBASE_PROJECT_ID = "matayehuda";
export const FIREBASE_VAPID_CONSOLE_PATH =
    "Project Settings -> Cloud Messaging -> Web Push certificates -> Key pair";

export function isVapidKeyConfigured() {
    return Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim());
}

export function getConfiguredVapidKey() {
    return import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim() || "";
}

export function validateFcmEnvironmentAtStartup() {
    if (isVapidKeyConfigured()) {
        console.info(`${LOG_PREFIX} VAPID key loaded`);
        return true;
    }

    console.warn(
        `${LOG_PREFIX} Push notifications are optional. Missing VITE_FIREBASE_VAPID_KEY — FCM disabled until configured.`
    );
    console.warn(
        `${LOG_PREFIX} Get the key from Firebase Console: ${FIREBASE_VAPID_CONSOLE_PATH}`
    );

    return false;
}

function is401SubscribeFailure(error) {
    const haystack = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();

    return (
        haystack.includes("401") ||
        haystack.includes("unauthenticated") ||
        haystack.includes("token-subscribe-failed")
    );
}

export function validateFcmConfigConsistency(firebaseEnvValues) {
    const appId = firebaseEnvValues?.appId || "";
    const messagingSenderId = String(
        firebaseEnvValues?.messagingSenderId || ""
    ).trim();
    const projectId = firebaseEnvValues?.projectId || "";
    const appIdMatch = appId.match(/^1:(\d+):/);
    const appIdSender = appIdMatch?.[1] || "";

    if (appIdSender && messagingSenderId && appIdSender !== messagingSenderId) {
        console.error(
            `${LOG_PREFIX} Config mismatch: VITE_FIREBASE_APP_ID sender (${appIdSender}) does not match VITE_FIREBASE_MESSAGING_SENDER_ID (${messagingSenderId})`
        );
        return false;
    }

    if (projectId && projectId !== FIREBASE_PROJECT_ID) {
        console.warn(
            `${LOG_PREFIX} Project ID "${projectId}" differs from expected "${FIREBASE_PROJECT_ID}"`
        );
    }

    console.info(`${LOG_PREFIX} Firebase config consistency check passed`, {
        projectId,
        messagingSenderId,
        appIdSender: appIdSender || "(not parsed)"
    });

    return true;
}

export function explainGetTokenFailure(error) {
    const code = error?.code || "unknown";
    const message = error?.message || "Unknown error";
    const normalizedMessage = message.toLowerCase();

    if (message === "FCM_GET_TOKEN_TIMEOUT") {
        return {
            code: "FCM_GET_TOKEN_TIMEOUT",
            message,
            explanation:
                "getToken() timed out. Push notifications are optional — the site continues to work. Retry from /fcm-test after fixing FCM configuration."
        };
    }

    if (code === 20 || normalizedMessage.includes("registration failed - permission denied")) {
        return {
            code,
            message,
            explanation:
                "Push subscription was blocked by the browser (common in incognito/private mode or when OS-level notifications are disabled). Use a normal browser window and allow notifications in system settings."
        };
    }

    if (code === "messaging/token-subscribe-failed" && is401SubscribeFailure(error)) {
        return {
            code,
            message,
            explanation:
                "FCM registration returned 401 UNAUTHENTICATED. In Google Cloud Console → APIs & Services → Credentials, open the Browser API key used by this app and ensure: (1) Application restrictions are None or include your site (localhost + production domain), (2) API restrictions allow Firebase Installations API and Firebase Cloud Messaging API, (3) VITE_FIREBASE_VAPID_KEY matches Project Settings → Cloud Messaging → Web Push certificates for project matayehuda, (4) the service worker config matches .env (run npm run dev/build to regenerate public/firebase-messaging-sw.js)."
        };
    }

    const explanations = {
        "messaging/permission-blocked":
            "Browser notification permission is blocked. Allow notifications for this site in browser settings.",
        "messaging/permission-default":
            "Notification permission was not granted yet. Click the opt-in button and allow notifications.",
        "messaging/failed-service-worker-registration":
            "The Firebase messaging service worker could not register. Check /firebase-messaging-sw.js and hard-refresh the page.",
        "messaging/invalid-vapid-key":
            "The VAPID key in VITE_FIREBASE_VAPID_KEY does not match the Firebase project. Copy the Web Push key pair again from Firebase Console.",
        "messaging/token-subscribe-failed":
            "Firebase could not subscribe this browser to push notifications. Verify Cloud Messaging API and Firebase Installations API are enabled, and that the service worker Firebase config matches your .env values.",
        "messaging/unsupported-browser":
            "This browser does not support Firebase Cloud Messaging.",
        "messaging/installations/request-failed":
            "Firebase Installations request failed. Check network connectivity, API key restrictions, and Firebase project configuration."
    };

    return {
        code,
        message,
        explanation:
            explanations[code] ||
            "Firebase could not generate a push token. Check VAPID key, service worker, and notification permission."
    };
}
