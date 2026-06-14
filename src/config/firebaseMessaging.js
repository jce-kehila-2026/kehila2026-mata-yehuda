import { getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

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
    console.info(`${LOG_PREFIX} Firebase Messaging initialized`);
    return messagingInstance;
}

export function getVapidKey() {
    return import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim() || "";
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
    console.info(`${LOG_PREFIX} Notification permission status: ${permission}`);

    if (permission === "default" && promptIfNeeded) {
        console.info(`${LOG_PREFIX} Requesting notification permission...`);
        permission = await Notification.requestPermission();
        console.info(`${LOG_PREFIX} Permission request result: ${permission}`);
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
        console.info(
            `${LOG_PREFIX} Registering service worker /firebase-messaging-sw.js`
        );
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );
        const readyRegistration = await navigator.serviceWorker.ready;

        console.info(`${LOG_PREFIX} Service worker registration result`, {
            scope: registration.scope,
            scriptURL: registration.active?.scriptURL || null,
            active: Boolean(registration.active),
            installing: Boolean(registration.installing),
            waiting: Boolean(registration.waiting),
            readyScope: readyRegistration.scope
        });

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
    console.info(`${LOG_PREFIX} Calling getToken() from Firebase Messaging`);

    const vapidKey = getVapidKey();
    console.info(`${LOG_PREFIX} VITE_FIREBASE_VAPID_KEY exists:`, Boolean(vapidKey));

    if (!vapidKey) {
        logNoToken("VITE_FIREBASE_VAPID_KEY is missing from environment");
        return { ok: false, reason: "VAPID_KEY_MISSING" };
    }

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
            console.error(`${LOG_PREFIX} getToken() failure: empty token`);
            return { ok: false, reason: "GET_TOKEN_EMPTY" };
        }

        console.info(`${LOG_PREFIX} getToken() success`, { token });
        return { ok: true, token, messaging };
    } catch (error) {
        logNoToken("getToken() failed", {
            code: error?.code,
            message: error?.message
        });
        console.error(`${LOG_PREFIX} getToken() failure`, {
            code: error?.code,
            message: error?.message
        });
        return {
            ok: false,
            reason: "GET_TOKEN_FAILED",
            error
        };
    }
}

export async function acquireFcmTokenWithPermission({
    requestPermission = true
} = {}) {
    console.info(`${LOG_PREFIX} acquireFcmTokenWithPermission() started`, {
        requestPermission,
        vapidKeyConfigured: Boolean(getVapidKey())
    });

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
