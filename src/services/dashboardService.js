import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { fetchActivities } from "./activityService";
import { getCancellationRequests } from "./cancellationService";
import { fetchInitialRegistrationRequests } from "./registrationService";

function getTimestampMillis(value) {
    if (!value) {
        return 0;
    }

    if (value.toDate) {
        return value.toDate().getTime();
    }

    if (value.seconds) {
        return value.seconds * 1000;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function startOfTodayMillis() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return today.getTime();
}

function getUpcomingActivities(activities) {
    const start = startOfTodayMillis();

    return activities
        .filter((activity) => getTimestampMillis(activity.data?.start_date) >= start)
        .sort(
            (a, b) =>
                getTimestampMillis(a.data?.start_date) -
                getTimestampMillis(b.data?.start_date)
        )
        .slice(0, 5);
}

function countUpcomingActivities(activities) {
    const start = startOfTodayMillis();

    return activities.filter(
        (activity) => getTimestampMillis(activity.data?.start_date) >= start
    ).length;
}

async function fetchSentMessagesSummary() {
    const snapshot = await getDocs(collection(db, "messages"));
    const messages = snapshot.docs
        .map((messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data()
        }))
        .filter((message) => message.status === "sent")
        .sort(
            (a, b) => getTimestampMillis(b.created_at) - getTimestampMillis(a.created_at)
        );

    return {
        sentCount: messages.length,
        latest: messages[0] || null
    };
}

export function getRequestProgramLabel(request) {
    const activityName = String(request?.activity_name ?? "").trim();
    const programTitle = String(request?.program_title ?? "").trim();

    if (activityName) {
        return activityName;
    }

    if (programTitle) {
        return programTitle;
    }

    return "";
}

export async function fetchDashboardOverview() {
    const [pendingRequests, activities, cancellations, messagesSummary] =
        await Promise.all([
            fetchInitialRegistrationRequests({ programFilter: "all" }),
            fetchActivities(),
            getCancellationRequests(),
            fetchSentMessagesSummary()
        ]);

    return {
        pendingCount: pendingRequests.length,
        pendingRequests: pendingRequests.slice(0, 5),
        upcomingActivities: getUpcomingActivities(activities),
        upcomingActivityCount: countUpcomingActivities(activities),
        recentCancellations: cancellations.slice(0, 5),
        cancellationCount: cancellations.length,
        sentMessageCount: messagesSummary.sentCount,
        latestMessage: messagesSummary.latest
    };
}
