import { useEffect, useState } from "react";
import { onMessage } from "firebase/messaging";
import {
    acquireFcmTokenWithPermission,
    getFirebaseMessaging
} from "../config/firebaseMessaging";
import { isVapidKeyConfigured } from "../config/fcmEnvironment";
import {
    getStoredFcmToken,
    resolveNotificationGroupsForParticipant,
    saveNotificationToken,
    storeFcmTokenLocally,
    touchNotificationToken
} from "../services/staffManegmentServices/notificationTokenService";

const LOG_PREFIX = "[fcm]";
const FCM_TOKEN_STORAGE_KEY = "fcm_token";

function getInitialGenerationStatus() {
    if (!isVapidKeyConfigured()) {
        return "missing_vapid_key";
    }

    if (getStoredFcmToken()) {
        return "token_in_local_storage";
    }

    if (typeof Notification !== "undefined") {
        if (Notification.permission === "default") {
            return "waiting_for_permission";
        }

        if (Notification.permission === "denied") {
            return "permission_denied";
        }

        if (Notification.permission === "granted") {
            return "ready_to_generate";
        }
    }

    return "idle";
}

function mapFcmReasonToMessage(reason, result = {}) {
    switch (reason) {
        case "NOTIFICATION_API_UNSUPPORTED":
            return "הדפדפן אינו תומך בהתראות";
        case "PERMISSION_NOT_GRANTED":
            return "לא ניתנה הרשאה להתראות";
        case "VAPID_KEY_MISSING":
            return "מפתח VAPID חסר בהגדרות המערכת";
        case "MESSAGING_NOT_SUPPORTED":
            return "התראות אינן נתמכות בדפדפן זה";
        case "SERVICE_WORKER_UNSUPPORTED":
        case "SERVICE_WORKER_REGISTRATION_FAILED":
            return "שגיאה ברישום Service Worker להתראות";
        case "GET_TOKEN_EMPTY":
            return result.explanation || "לא התקבל אסימון התראה";
        case "GET_TOKEN_FAILED":
            return result.explanation || "שגיאה בקבלת אסימון התראה";
        default:
            return "שגיאה בהפעלת התראות";
    }
}

async function checkServiceWorkerRegistered() {
    if (!("serviceWorker" in navigator)) {
        return false;
    }

    const registration = await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js"
    );

    return Boolean(registration?.active);
}

async function persistFcmToken({ token, participantId = "" }) {
    const groups = await resolveNotificationGroupsForParticipant(participantId);

    await saveNotificationToken({
        token,
        participantId,
        groups
    });

    console.info(`${LOG_PREFIX} Token saved to Firestore`);

    storeFcmTokenLocally(token);

    console.info(`${LOG_PREFIX} Token saved to localStorage`);
}

export function useFcmTokenRegistration({ enabled = true } = {}) {
    const [permission, setPermission] = useState(
        () =>
            (typeof Notification !== "undefined" && Notification.permission) ||
            "default"
    );
    const [token, setToken] = useState(() => getStoredFcmToken());
    const [error, setError] = useState("");
    const [generationStatus, setGenerationStatus] = useState(
        getInitialGenerationStatus
    );
    const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(null);
    const [lastFailure, setLastFailure] = useState(null);

    useEffect(() => {
        console.info(`${LOG_PREFIX} hook mounted`, {
            enabled,
            permission:
                typeof Notification !== "undefined"
                    ? Notification.permission
                    : "unavailable",
            storedToken: getStoredFcmToken() || null,
            vapidKeyConfigured: isVapidKeyConfigured()
        });
    }, [enabled]);

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        let cancelled = false;

        async function initializeTokenRegistration() {
            setLastFailure(null);

            if (!isVapidKeyConfigured()) {
                setGenerationStatus("missing_vapid_key");
                return;
            }

            console.info(`${LOG_PREFIX} VAPID key loaded`);

            const existingToken = getStoredFcmToken();

            if (existingToken) {
                setGenerationStatus("syncing_existing_token");

                try {
                    await touchNotificationToken(existingToken);

                    if (!cancelled) {
                        setToken(existingToken);
                        setGenerationStatus("success");
                    }
                } catch (syncError) {
                    console.error(
                        `${LOG_PREFIX} Failed to sync localStorage token to Firestore`,
                        syncError
                    );

                    if (!cancelled) {
                        setGenerationStatus("sync_failed");
                    }
                }

                return;
            }

            if (!("Notification" in window)) {
                setGenerationStatus("notifications_unsupported");
                return;
            }

            const currentPermission = Notification.permission;

            if (!cancelled) {
                setPermission(currentPermission);
            }

            if (currentPermission === "default") {
                setGenerationStatus("waiting_for_permission");
                return;
            }

            if (currentPermission !== "granted") {
                setGenerationStatus("permission_denied");
                return;
            }

            console.info(
                `${LOG_PREFIX} Permission granted without stored token — skipping automatic getToken() (FCM optional)`
            );
            setGenerationStatus("optional_skipped");
            return;
        }

        initializeTokenRegistration();

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    useEffect(() => {
        if (!enabled || !token) {
            return undefined;
        }

        let unsubscribe = () => {};

        (async () => {
            try {
                const messaging = await getFirebaseMessaging();

                if (!messaging) {
                    return;
                }

                unsubscribe = onMessage(messaging, (payload) => {
                    console.info(`${LOG_PREFIX} Foreground message received`, payload);

                    const title =
                        payload.notification?.title || payload.data?.title || "מטה יהודה";
                    const body =
                        payload.notification?.body || payload.data?.body || "";

                    if (Notification.permission === "granted") {
                        console.info(`${LOG_PREFIX} Showing foreground browser notification`, {
                            title,
                            body
                        });
                        new Notification(title, {
                            body,
                            icon: "/favicon.svg"
                        });
                    }
                });
            } catch (onMessageError) {
                console.warn(
                    `${LOG_PREFIX} Foreground messaging unavailable — continuing without push`,
                    onMessageError
                );
            }
        })();

        return () => {
            unsubscribe();
        };
    }, [enabled, token]);

    async function requestNotificationPermission(participantId = "") {
        setError("");
        setLastFailure(null);

        if (!isVapidKeyConfigured()) {
            setGenerationStatus("missing_vapid_key");
            setError("מפתח VAPID חסר בהגדרות המערכת");
            return null;
        }

        setGenerationStatus("generating_token");

        const result = await acquireFcmTokenWithPermission({
            requestPermission: true
        });

        const swRegistered = await checkServiceWorkerRegistered();
        setServiceWorkerRegistered(swRegistered);

        if (result.permission) {
            setPermission(result.permission);
        }

        if (!result.ok) {
            const message = mapFcmReasonToMessage(result.reason, result);
            setError(message);
            setGenerationStatus(result.reason || "failed");
            setLastFailure(
                result.code
                    ? {
                          code: result.code,
                          explanation: result.explanation
                      }
                    : null
            );
            console.error(`${LOG_PREFIX} Manual opt-in failed`, {
                reason: result.reason,
                message,
                code: result.code,
                explanation: result.explanation
            });
            return null;
        }

        try {
            await persistFcmToken({
                token: result.token,
                participantId
            });
        } catch (persistError) {
            console.error(
                `${LOG_PREFIX} Failed to save token to Firestore`,
                persistError
            );
            setError("שגיאה בשמירת אסימון ההתראה");
            setGenerationStatus("persist_failed");
            return null;
        }

        setPermission("granted");
        setToken(result.token);
        setGenerationStatus("success");
        return result.token;
    }

    return {
        permission,
        token,
        error,
        generationStatus,
        serviceWorkerRegistered,
        lastFailure,
        requestNotificationPermission
    };
}
