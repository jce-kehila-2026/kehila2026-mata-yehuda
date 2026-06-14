import { useEffect, useState } from "react";
import { onMessage } from "firebase/messaging";
import {
    acquireFcmTokenWithPermission,
    getFirebaseMessaging
} from "../config/firebaseMessaging";
import {
    getStoredFcmToken,
    resolveNotificationGroupsForParticipant,
    saveNotificationToken,
    storeFcmTokenLocally,
    touchNotificationToken
} from "../services/staffManegmentServices/notificationTokenService";

const LOG_PREFIX = "[fcm]";

function mapFcmReasonToMessage(reason) {
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
            return "לא התקבל אסימון התראה";
        case "GET_TOKEN_FAILED":
            return "שגיאה בקבלת אסימון התראה";
        default:
            return "שגיאה בהפעלת התראות";
    }
}

async function persistFcmToken({ token, participantId = "" }) {
    const groups = await resolveNotificationGroupsForParticipant(participantId);

    console.info(`${LOG_PREFIX} Persisting token to Firestore`, {
        participantId: participantId || "(anonymous)",
        groups
    });

    await saveNotificationToken({
        token,
        participantId,
        groups
    });

    storeFcmTokenLocally(token);
    console.info(`${LOG_PREFIX} Token persisted successfully`);
}

export function useFcmTokenRegistration({ enabled = true } = {}) {
    const [permission, setPermission] = useState(
        () => Notification.permission || "default"
    );
    const [token, setToken] = useState(() => getStoredFcmToken());
    const [error, setError] = useState("");

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        let cancelled = false;

        async function initializeTokenRegistration() {
            const existingToken = getStoredFcmToken();

            if (existingToken) {
                console.info(
                    `${LOG_PREFIX} Found token in localStorage, syncing to Firestore`
                );

                try {
                    await touchNotificationToken(existingToken);

                    if (!cancelled) {
                        setToken(existingToken);
                    }

                    console.info(
                        `${LOG_PREFIX} localStorage token synced to notification_tokens`
                    );
                } catch (syncError) {
                    console.error(
                        `${LOG_PREFIX} Failed to sync localStorage token to Firestore`,
                        syncError
                    );
                }

                return;
            }

            if (!("Notification" in window)) {
                console.info(
                    `${LOG_PREFIX} No FCM token yet: browser does not support notifications`
                );
                return;
            }

            const currentPermission = Notification.permission;

            if (!cancelled) {
                setPermission(currentPermission);
            }

            if (currentPermission !== "granted") {
                console.info(
                    `${LOG_PREFIX} No FCM token yet: browser permission is "${currentPermission}"`
                );
                return;
            }

            console.info(
                `${LOG_PREFIX} Permission already granted but no stored token; acquiring FCM token automatically`
            );

            try {
                const result = await acquireFcmTokenWithPermission({
                    requestPermission: false
                });

                if (cancelled || !result.ok) {
                    return;
                }

                await persistFcmToken({
                    token: result.token,
                    participantId: ""
                });

                if (!cancelled) {
                    setToken(result.token);
                    setPermission("granted");
                }
            } catch (initError) {
                console.error(
                    `${LOG_PREFIX} Automatic token acquisition failed`,
                    initError
                );
            }
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
            const messaging = await getFirebaseMessaging();

            if (!messaging) {
                return;
            }

            unsubscribe = onMessage(messaging, (payload) => {
                const title =
                    payload.notification?.title || payload.data?.title || "מטה יהודה";
                const body =
                    payload.notification?.body || payload.data?.body || "";

                if (Notification.permission === "granted") {
                    new Notification(title, {
                        body,
                        icon: "/favicon.svg"
                    });
                }
            });
        })();

        return () => {
            unsubscribe();
        };
    }, [enabled, token]);

    async function requestNotificationPermission(participantId = "") {
        setError("");

        console.info(`${LOG_PREFIX} Manual notification opt-in started`, {
            participantId: participantId || "(anonymous)"
        });

        const result = await acquireFcmTokenWithPermission({
            requestPermission: true
        });

        if (result.permission) {
            setPermission(result.permission);
        }

        if (!result.ok) {
            const message = mapFcmReasonToMessage(result.reason);
            setError(message);
            console.error(`${LOG_PREFIX} Manual opt-in failed`, {
                reason: result.reason,
                message
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
            return null;
        }

        setPermission("granted");
        setToken(result.token);
        return result.token;
    }

    return {
        permission,
        token,
        error,
        requestNotificationPermission
    };
}
