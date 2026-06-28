import { db } from "../../config/firebase";
import {
    collection,
    getCountFromServer,
    getDocs,
    limit,
    orderBy,
    query,
    where
} from "firebase/firestore";

function getTimestampMillis(value) {
    if (!value) {
        return 0;
    }

    if (typeof value.toDate === "function") {
        return value.toDate().getTime();
    }

    if (typeof value.seconds === "number") {
        return value.seconds * 1000;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function startOfWeekMillis() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);

    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - diff);

    return monday.getTime();
}

function countActiveDevices(tokenDocs) {
    return tokenDocs.length;
}

async function countParticipantsWithNotificationConsent() {
    const snapshot = await getCountFromServer(
        query(
            collection(db, "participants"),
            where("marketing_consent", "==", true)
        )
    );

    return snapshot.data().count;
}

function computeSentThisWeek(logDocs) {
    const weekStart = startOfWeekMillis();

    return logDocs.filter(
        (log) => getTimestampMillis(log.sentAt) >= weekStart
    ).length;
}

export async function fetchNotificationDashboardData() {
    const [registeredParticipants, tokensSnapshot, logsSnapshot] = await Promise.all([
        countParticipantsWithNotificationConsent(),
        getDocs(
            query(
                collection(db, "notification_tokens"),
                where("isActive", "==", true)
            )
        ),
        getDocs(
            query(
                collection(db, "notifications_log"),
                orderBy("sentAt", "desc"),
                limit(100)
            )
        )
    ]);

    const tokenDocs = tokensSnapshot.docs.map((tokenDoc) => tokenDoc.data());

    const recentNotifications = logsSnapshot.docs.map((logDoc) => ({
        id: logDoc.id,
        ...logDoc.data()
    }));

    return {
        stats: {
            registeredParticipants,
            activeDevices: countActiveDevices(tokenDocs),
            sentThisWeek: computeSentThisWeek(recentNotifications)
        },
        recentNotifications
    };
}
