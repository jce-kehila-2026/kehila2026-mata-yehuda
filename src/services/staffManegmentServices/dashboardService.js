import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { fetchActivities } from "./activityService";
import { getCancellationRequests } from "./cancellationService";
import { fetchWaitingRequests } from "../RespOneonRequest/requestsService";
import { sortWaitingRequests } from "../../utils/RespOneonRequest/formatters";
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

async function fetchSentNotificationsSummary() {
    const snapshot = await getDocs(collection(db, "notifications_log"));
    const notifications = snapshot.docs
        .map((logDoc) => ({
            id: logDoc.id,
            ...logDoc.data()
        }))
        .sort(
            (a, b) => getTimestampMillis(b.sentAt) - getTimestampMillis(a.sentAt)
        );

    return {
        sentCount: notifications.length,
        latest: notifications[0] || null
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

function mapRequestToDashboardInquiry(request) {
    const content = String(request?.content ?? "").trim();

    return {
        id: request.id,
        senderName: String(request?.phone ?? "").trim(),
        subject:
            content.length > 72 ? `${content.slice(0, 72).trim()}…` : content,
        createdAt: request?.date ?? request?.createdAt ?? null,
        status: request?.status ?? "waiting"
    };
}

export async function fetchDashboardOverview() {
    const [pendingRequests, activities, cancellations, waitingInquiries, notificationsSummary] =
        await Promise.all([
            fetchInitialRegistrationRequests({ programFilter: "all" }),
            fetchActivities(),
            getCancellationRequests(),
            fetchWaitingRequests(),
            fetchSentNotificationsSummary()
        ]);

    const dashboardInquiries = sortWaitingRequests(waitingInquiries).map(
        mapRequestToDashboardInquiry
    );

    return {
        pendingCount: pendingRequests.length,
        pendingRequests: pendingRequests.slice(0, 5),
        upcomingActivities: getUpcomingActivities(activities),
        upcomingActivityCount: countUpcomingActivities(activities),
        activities,
        recentCancellations: cancellations.slice(0, 5),
        cancellationCount: cancellations.length,
        recentInquiries: dashboardInquiries.slice(0, 5),
        inquiryCount: dashboardInquiries.length,
        sentNotificationCount: notificationsSummary.sentCount,
        latestNotification: notificationsSummary.latest
    };
}
