import { db } from "../config/firebase";
import {
    collection,
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

function computeStatsFromTokens(tokenDocs) {
    const participantIds = new Set();

    tokenDocs.forEach((tokenDoc) => {
        const participantId = String(tokenDoc.participantId || "").trim();

        if (participantId) {
            participantIds.add(participantId);
        }
    });

    const activeDevices = tokenDocs.length;

    return {
        registeredParticipants: participantIds.size || activeDevices,
        activeDevices,
        participantCountIsEstimated: participantIds.size === 0 && activeDevices > 0
    };
}

function computeSentThisWeek(logDocs) {
    const weekStart = startOfWeekMillis();

    return logDocs.filter(
        (log) => getTimestampMillis(log.sentAt) >= weekStart
    ).length;
}

export async function fetchNotificationDashboardData() {
    const [tokensSnapshot, logsSnapshot] = await Promise.all([
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
                limit(12)
            )
        )
    ]);

    const tokenDocs = tokensSnapshot.docs.map((tokenDoc) => tokenDoc.data());
    const tokenStats = computeStatsFromTokens(tokenDocs);

    const recentNotifications = logsSnapshot.docs.map((logDoc) => ({
        id: logDoc.id,
        ...logDoc.data()
    }));

    return {
        stats: {
            registeredParticipants: tokenStats.registeredParticipants,
            activeDevices: tokenStats.activeDevices,
            sentThisWeek: computeSentThisWeek(recentNotifications)
        },
        recentNotifications: recentNotifications.slice(0, 5)
    };
}
