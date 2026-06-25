const LOG_PREFIX = "[fcm]";

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
        return true;
    }

    console.error(
        `${LOG_PREFIX} Missing VITE_FIREBASE_VAPID_KEY. Please add it to .env`
    );
    console.error(
        `${LOG_PREFIX} Get the key from Firebase Console: ${FIREBASE_VAPID_CONSOLE_PATH}`
    );
    console.error(
        `${LOG_PREFIX} Firebase project: ${FIREBASE_PROJECT_ID} (Project Settings -> General -> Project ID)`
    );

    return false;
}

export function explainGetTokenFailure(error) {
    const code = error?.code || "unknown";
    const message = error?.message || "Unknown error";

    const explanations = {
        "messaging/permission-blocked":
            "Browser notification permission is blocked. Allow notifications for this site in browser settings.",
        "messaging/permission-default":
            "Notification permission was not granted yet. Check the opt-in checkbox and allow notifications when prompted.",
        "messaging/failed-service-worker-registration":
            "The Firebase messaging service worker could not register. Check /firebase-messaging-sw.js and hard-refresh the page.",
        "messaging/invalid-vapid-key":
            "The VAPID key in VITE_FIREBASE_VAPID_KEY does not match the Firebase project. Copy the Web Push key pair again from Firebase Console.",
        "messaging/token-subscribe-failed":
            "Firebase could not subscribe this browser to push notifications. Verify Cloud Messaging is enabled for the web app.",
        "messaging/unsupported-browser":
            "This browser does not support Firebase Cloud Messaging.",
        "messaging/installations/request-failed":
            "Firebase Installations request failed. Check network connectivity and Firebase project configuration."
    };

    return {
        code,
        message,
        explanation:
            explanations[code] ||
            "Firebase could not generate a push token. Check VAPID key, service worker, and notification permission."
    };
}
