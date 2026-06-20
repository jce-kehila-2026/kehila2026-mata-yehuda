import { getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import {
    explainGetTokenFailure,
    getConfiguredVapidKey,
    isVapidKeyConfigured
} from "./fcmEnvironment";

const LOG_PREFIX = "[fcm]";

const GET_TOKEN_TIMEOUT_MS = 25000;

let messagingInstance = null;
let pendingTokenAcquisition = null;

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
        console.info(`${LOG_PREFIX} Registering service worker`);
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
    if (!isVapidKeyConfigured()) {
        logNoToken("VITE_FIREBASE_VAPID_KEY is missing from environment");
        return { ok: false, reason: "VAPID_KEY_MISSING" };
    }

    console.info(`${LOG_PREFIX} VAPID key loaded`);
    console.info(`${LOG_PREFIX} Calling getToken()`);

    const vapidKey = getVapidKey();
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
        return { ok: false, reason: "MESSAGING_NOT_SUPPORTED" };
    }

    try {
        const token = await Promise.race([
            getToken(messaging, {
                vapidKey,
                serviceWorkerRegistration: serviceWorkerRegistration || undefined
            }),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error("FCM_GET_TOKEN_TIMEOUT"));
                }, GET_TOKEN_TIMEOUT_MS);
            })
        ]);

        if (!token) {
            logNoToken("getToken() returned an empty value");
            return {
                ok: false,
                reason: "GET_TOKEN_EMPTY",
                explanation:
                    "Firebase returned an empty token. Check notification permission and service worker registration."
            };
        }

        console.info(`${LOG_PREFIX} Token generated`, { token });
        return { ok: true, token, messaging };
    } catch (error) {
        const failure = explainGetTokenFailure(error);

        logNoToken("getToken() failed", failure);
        console.error(`${LOG_PREFIX} getToken() failure`, failure);

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
    if (pendingTokenAcquisition) {
        console.info(`${LOG_PREFIX} Reusing in-flight token acquisition request`);
        return pendingTokenAcquisition;
    }

    pendingTokenAcquisition = acquireFcmTokenWithPermissionInternal({
        requestPermission
    });

    try {
        return await pendingTokenAcquisition;
    } finally {
        pendingTokenAcquisition = null;
    }
}

async function acquireFcmTokenWithPermissionInternal({
    requestPermission = true
} = {}) {
    try {
        if (!isVapidKeyConfigured()) {
            logNoToken("VITE_FIREBASE_VAPID_KEY is missing from environment");
            return { ok: false, reason: "VAPID_KEY_MISSING" };
        }

        console.info(`${LOG_PREFIX} acquireFcmTokenWithPermission() started`, {
            requestPermission,
            vapidKeyConfigured: true
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
    } catch (error) {
        const failure = explainGetTokenFailure(error);

        logNoToken("acquireFcmTokenWithPermission() failed unexpectedly", failure);

        return {
            ok: false,
            reason: "GET_TOKEN_FAILED",
            error,
            ...failure
        };
    }
}
