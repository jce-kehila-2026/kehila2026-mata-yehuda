import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging, getVapidKey } from "../config/firebaseMessaging";
import {
    getStoredFcmToken,
    resolveNotificationGroupsForParticipant,
    saveNotificationToken,
    storeFcmTokenLocally,
    touchNotificationToken
} from "../services/notificationTokenService";

async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return null;
    }

    return navigator.serviceWorker.register("/firebase-messaging-sw.js");
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

        async function syncExistingToken() {
            const existingToken = getStoredFcmToken();

            if (!existingToken) {
                return;
            }

            try {
                await touchNotificationToken(existingToken);

                if (!cancelled) {
                    setToken(existingToken);
                }
            } catch (syncError) {
                console.error("[fcm] touch token failed", syncError);
            }
        }

        syncExistingToken();

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

        if (!("Notification" in window)) {
            setError("הדפדפן אינו תומך בהתראות");
            return null;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result !== "granted") {
            setError("לא ניתנה הרשאה להתראות");
            return null;
        }

        const vapidKey = getVapidKey();

        if (!vapidKey) {
            setError("מפתח VAPID חסר בהגדרות המערכת");
            return null;
        }

        const messaging = await getFirebaseMessaging();

        if (!messaging) {
            setError("התראות אינן נתמכות בדפדפן זה");
            return null;
        }

        const registration = await registerServiceWorker();
        const nextToken = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration || undefined
        });

        if (!nextToken) {
            setError("לא התקבל אסימון התראה");
            return null;
        }

        const groups = await resolveNotificationGroupsForParticipant(participantId);

        await saveNotificationToken({
            token: nextToken,
            participantId,
            groups
        });

        storeFcmTokenLocally(nextToken);
        setToken(nextToken);
        return nextToken;
    }

    return {
        permission,
        token,
        error,
        requestNotificationPermission
    };
}
