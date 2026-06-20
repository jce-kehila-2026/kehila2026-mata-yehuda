import { getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import {
    explainGetTokenFailure,
    getConfiguredVapidKey,
    isVapidKeyConfigured
} from "./fcmEnvironment";

const LOG_PREFIX = "[fcm]";

let messagingInstance = null;

function logNoToken(reason, details = {}) {
    console.error(`${LOG_PREFIX} No FCM token: ${reason}`, details);
}

export async function getFirebaseMessaging() {
    if (messagingInstance) {
        return messagingInstance;
    }

    const supported = await isSupported();

    if (!supported) {
        logNoToken("Firebase Messaging is not supported in this browser");
        return null;
    }

    messagingInstance = getMessaging(getApp());
    return messagingInstance;
}

export function getVapidKey() {
    return getConfiguredVapidKey();
}

export async function requestBrowserNotificationPermission({
    promptIfNeeded = true
} = {}) {
    if (!("Notification" in window)) {
        logNoToken("browser does not support the Notification API");
        return {
            ok: false,
            reason: "NOTIFICATION_API_UNSUPPORTED",
            permission: "unsupported"
        };
    }

    let permission = Notification.permission;

    if (permission === "default" && promptIfNeeded) {
        permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
        logNoToken(`notification permission is "${permission}"`, { permission });
        return {
            ok: false,
            reason: "PERMISSION_NOT_GRANTED",
            permission
        };
    }

    return {
        ok: true,
        permission
    };
}

export async function registerMessagingServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        logNoToken("service workers are not supported in this browser");
        return { ok: false, reason: "SERVICE_WORKER_UNSUPPORTED" };
    }

    try {
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );
        const readyRegistration = await navigator.serviceWorker.ready;

        return { ok: true, registration: readyRegistration };
    } catch (error) {
        logNoToken("service worker registration failed", {
            message: error?.message
        });
        return {
            ok: false,
            reason: "SERVICE_WORKER_REGISTRATION_FAILED",
            error
        };
    }
}

export async function fetchFcmToken(serviceWorkerRegistration) {
    if (!isVapidKeyConfigured()) {
        logNoToken("VITE_FIREBASE_VAPID_KEY is missing from environment");
        return { ok: false, reason: "VAPID_KEY_MISSING" };
    }

    const vapidKey = getVapidKey();
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
        return { ok: false, reason: "MESSAGING_NOT_SUPPORTED" };
    }

    try {
        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: serviceWorkerRegistration || undefined
        });

        if (!token) {
            logNoToken("getToken() returned an empty value");
            return {
                ok: false,
                reason: "GET_TOKEN_EMPTY",
                explanation:
                    "Firebase returned an empty token. Check notification permission and service worker registration."
            };
        }

        return { ok: true, token, messaging };
    } catch (error) {
        const failure = explainGetTokenFailure(error);

        logNoToken("getToken() failed", failure);

        return {
            ok: false,
            reason: "GET_TOKEN_FAILED",
            error,
            ...failure
        };
    }
}

export async function acquireFcmTokenWithPermission({
    requestPermission = true
} = {}) {
    if (!isVapidKeyConfigured()) {
        logNoToken("VITE_FIREBASE_VAPID_KEY is missing from environment");
        return { ok: false, reason: "VAPID_KEY_MISSING" };
    }

    const permissionResult = await requestBrowserNotificationPermission({
        promptIfNeeded: requestPermission
    });

    if (!permissionResult.ok) {
        return permissionResult;
    }

    const serviceWorkerResult = await registerMessagingServiceWorker();

    if (!serviceWorkerResult.ok) {
        return serviceWorkerResult;
    }

    return fetchFcmToken(serviceWorkerResult.registration);
}
