import { db } from "../../config/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where
} from "firebase/firestore";
import { getParticipantNotificationGroups } from "./notificationGroupService";
import { NOTIFICATION_GROUP_ALL } from "../../utils/staffManegmentUtils/notificationGroupMapping";

export async function verifyParticipantForNotifications({ idNumber, phone }) {
    const normalizedId = String(idNumber || "").trim();
    const normalizedPhone = String(phone || "").trim();

    if (!normalizedId) {
        return {
            ok: false,
            message: "יש להזין מספר תעודת זהות"
        };
    }

    const participantsQuery = query(
        collection(db, "participants"),
        where("id_number", "==", normalizedId)
    );
    const snapshot = await getDocs(participantsQuery);

    if (snapshot.empty) {
        return {
            ok: false,
            message: "לא נמצא משתתף עם מספר תעודת זהות זה"
        };
    }

    const participantDoc = snapshot.docs[0];
    const participant = participantDoc.data();
    const storedPhone = String(participant.phone || "").trim();

    if (normalizedPhone && storedPhone && storedPhone !== normalizedPhone) {
        return {
            ok: false,
            message: "מספר הטלפון אינו תואם לפרטי המשתתף"
        };
    }

    return {
        ok: true,
        participantId: participantDoc.id
    };
}

/**
 * Resolves groups for token persistence.
 * Verified participants get segments from registrations; others receive only "all".
 */
export async function resolveNotificationGroupsForParticipant(participantId) {
    const normalizedParticipantId = String(participantId || "").trim();

    if (!normalizedParticipantId) {
        return [NOTIFICATION_GROUP_ALL];
    }

    return getParticipantNotificationGroups(normalizedParticipantId);
}

export async function saveNotificationToken({
    token,
    participantId = "",
    groups
}) {
    const normalizedToken = String(token || "").trim();

    if (!normalizedToken) {
        console.error("[fcm] saveNotificationToken aborted: empty token");
        throw new Error("TOKEN_REQUIRED");
    }

    if (!Array.isArray(groups) || groups.length === 0) {
        console.error("[fcm] saveNotificationToken aborted: groups missing", {
            groups
        });
        throw new Error("GROUPS_REQUIRED");
    }

    const tokenRef = doc(db, "notification_tokens", normalizedToken);
    const existingSnap = await getDoc(tokenRef);
    const payload = {
        token: normalizedToken,
        groups,
        participantId: participantId || "",
        lastActive: serverTimestamp(),
        createdAt: existingSnap.exists()
            ? existingSnap.data().createdAt || serverTimestamp()
            : serverTimestamp(),
        isActive: true
    };

    console.info("[fcm] Writing notification_tokens document", {
        docId: normalizedToken,
        token: normalizedToken,
        isActive: payload.isActive,
        participantId: payload.participantId,
        groups: payload.groups,
        isUpdate: existingSnap.exists()
    });

    await setDoc(tokenRef, payload, { merge: true });

    console.info("[fcm] notification_tokens document saved", {
        docId: normalizedToken,
        isActive: true,
        participantId: payload.participantId,
        groups: payload.groups
    });
}

/**
 * Refreshes lastActive and re-derives groups when a returning user already has a token.
 * Groups stay ["all"] when the stored token has no linked participantId.
 */
export async function touchNotificationToken(token) {
    const normalizedToken = String(token || "").trim();

    if (!normalizedToken) {
        console.warn("[fcm] touchNotificationToken skipped: empty token");
        return;
    }

    console.info("[fcm] Refreshing notification_tokens document", {
        docId: normalizedToken
    });

    const tokenRef = doc(db, "notification_tokens", normalizedToken);
    const existingSnap = await getDoc(tokenRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : {};
    const participantId = String(existingData.participantId || "").trim();
    const groups = await resolveNotificationGroupsForParticipant(participantId);
    const payload = {
        token: normalizedToken,
        groups,
        lastActive: serverTimestamp(),
        isActive: true,
        ...(participantId ? { participantId } : {})
    };

    console.info("[fcm] Writing notification_tokens touch payload", {
        docId: normalizedToken,
        token: normalizedToken,
        isActive: payload.isActive,
        participantId: payload.participantId || "",
        groups: payload.groups,
        isUpdate: existingSnap.exists()
    });

    await setDoc(tokenRef, payload, { merge: true });

    console.info("[fcm] notification_tokens document refreshed", {
        docId: normalizedToken,
        isActive: true,
        participantId: payload.participantId || "",
        groups: payload.groups
    });
}

export function getStoredFcmToken() {
    try {
        return localStorage.getItem("fcm_token") || "";
    } catch {
        return "";
    }
}

export function storeFcmTokenLocally(token) {
    const storageKey = "fcm_token";

    try {
        if (token) {
            localStorage.setItem(storageKey, token);
            console.info(`[fcm] Saved token to localStorage key "${storageKey}"`, {
                token,
                storedValue: localStorage.getItem(storageKey)
            });
        } else {
            localStorage.removeItem(storageKey);
            console.info(`[fcm] Removed localStorage key "${storageKey}"`);
        }
    } catch (error) {
        console.error(`[fcm] Failed to write localStorage key "${storageKey}"`, error);
    }
}
