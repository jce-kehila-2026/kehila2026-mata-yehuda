import { getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

let messagingInstance = null;

export async function getFirebaseMessaging() {
    if (messagingInstance) {
        return messagingInstance;
    }

    const supported = await isSupported();

    if (!supported) {
        return null;
    }

    messagingInstance = getMessaging(getApp());
    return messagingInstance;
}

export function getVapidKey() {
    return import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim() || "";
}
