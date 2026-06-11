import admin from "firebase-admin";
import {
    getAdminFirestore,
    getAdminMessaging
} from "./firebaseAuth.js";
import {
    NOTIFICATION_GROUP_60_PLUS,
    load60PlusTargetTokenDocs
} from "./notificationTargeting.js";

const FCM_BATCH_SIZE = 500;
const TOKEN_STALE_DAYS = Number(process.env.FCM_TOKEN_STALE_DAYS) || 90;

function isTokenStale(lastActiveMs, nowMs) {
    if (!lastActiveMs) {
        return false;
    }

    const staleMs = TOKEN_STALE_DAYS * 24 * 60 * 60 * 1000;
    return nowMs - lastActiveMs > staleMs;
}

function collectTokenEntries(tokenDocs, nowMs) {
    const tokens = [];
    const seenTokens = new Set();

    for (const tokenDoc of tokenDocs) {
        const data = tokenDoc.data();
        const token = String(data.token || tokenDoc.id || "").trim();

        if (!token || seenTokens.has(token)) {
            continue;
        }

        const lastActiveMs = data.lastActive?.toMillis?.() || 0;

        if (isTokenStale(lastActiveMs, nowMs)) {
            continue;
        }

        seenTokens.add(token);
        tokens.push({
            token,
            docId: tokenDoc.id
        });
    }

    return tokens;
}

async function loadTargetTokens(targetGroup) {
    const db = getAdminFirestore();
    const nowMs = Date.now();

    if (targetGroup === NOTIFICATION_GROUP_60_PLUS) {
        const tokenDocs = await load60PlusTargetTokenDocs(db);
        return collectTokenEntries(tokenDocs, nowMs);
    }

    const snapshot = await db
        .collection("notification_tokens")
        .where("groups", "array-contains", targetGroup)
        .where("isActive", "==", true)
        .get();

    return collectTokenEntries(snapshot.docs, nowMs);
}

async function deactivateInvalidTokens(batchTokens, responses) {
    const db = getAdminFirestore();
    const updates = [];

    responses.forEach((response, index) => {
        if (response.success) {
            return;
        }

        const errorCode = response.error?.code || "";

        if (
            errorCode === "messaging/registration-token-not-registered" ||
            errorCode === "messaging/invalid-registration-token"
        ) {
            updates.push(
                db.collection("notification_tokens").doc(batchTokens[index].docId).update({
                    isActive: false
                })
            );
        }
    });

    if (updates.length > 0) {
        await Promise.all(updates);
    }
}

export async function sendFcmNotification({
    targetGroup,
    title,
    body,
    sentBy
}) {
    const normalizedGroup = String(targetGroup || "all").trim() || "all";
    const notificationTitle = String(title || "מטה יהודה").trim() || "מטה יהודה";
    const notificationBody = String(body || "").trim();

    if (!notificationBody) {
        throw new Error("MESSAGE_BODY_REQUIRED");
    }

    const tokenEntries = await loadTargetTokens(normalizedGroup);
    const messaging = getAdminMessaging();

    let successCount = 0;
    let failureCount = 0;

    for (let offset = 0; offset < tokenEntries.length; offset += FCM_BATCH_SIZE) {
        const batchEntries = tokenEntries.slice(offset, offset + FCM_BATCH_SIZE);
        const batchTokens = batchEntries.map((entry) => entry.token);

        const response = await messaging.sendEachForMulticast({
            tokens: batchTokens,
            notification: {
                title: notificationTitle,
                body: notificationBody
            },
            webpush: {
                notification: {
                    title: notificationTitle,
                    body: notificationBody
                },
                fcmOptions: {
                    link: process.env.CLIENT_ORIGIN?.trim() || "/"
                }
            }
        });

        successCount += response.successCount;
        failureCount += response.failureCount;

        await deactivateInvalidTokens(batchEntries, response.responses);
    }

    const db = getAdminFirestore();

    await db.collection("notifications_log").add({
        title: notificationTitle,
        body: notificationBody,
        targetGroup: normalizedGroup,
        sentBy: sentBy || "",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        totalTokens: tokenEntries.length,
        successCount,
        failureCount
    });

    return {
        targetGroup: normalizedGroup,
        totalTokens: tokenEntries.length,
        successCount,
        failureCount
    };
}
