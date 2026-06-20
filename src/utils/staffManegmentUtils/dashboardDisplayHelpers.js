export function getTimestampMillis(value) {
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

export function formatRelativeTimeHebrew(value) {
    const millis = getTimestampMillis(value);

    if (!millis) {
        return "לאחרונה";
    }

    const diffMs = Date.now() - millis;

    if (diffMs < 0) {
        return "בקרוב";
    }

    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) {
        return "לפני פחות מדקה";
    }

    if (minutes < 60) {
        return minutes === 1 ? "לפני דקה" : `לפני ${minutes} דקות`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return hours === 1 ? "לפני שעה" : `לפני ${hours} שעות`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return days === 1 ? "לפני יום" : days === 2 ? "לפני יומיים" : `לפני ${days} ימים`;
    }

    const weeks = Math.floor(days / 7);

    return weeks === 1 ? "לפני שבוע" : `לפני ${weeks} שבועות`;
}

export function getWeekActivities(upcomingActivities = []) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    const endMs = end.getTime();

    return upcomingActivities
        .filter((activity) => {
            const activityMs = getTimestampMillis(activity.data?.start_date);

            return activityMs >= startMs && activityMs <= endMs;
        })
        .slice(0, 5);
}

export function buildRecentUpdates(overview) {
    if (!overview) {
        return [];
    }

    const items = [];

    if (overview.latestNotification) {
        items.push({
            id: `notification-${overview.latestNotification.id ?? "latest"}`,
            title: "נשלחה הודעה למשתתפים",
            timestamp: overview.latestNotification.sentAt,
            page: "messages"
        });
    }

    for (const item of overview.recentCancellations ?? []) {
        const name = item.participantFullName || "משתתף";

        items.push({
            id: `cancel-${item.cancellation?.id ?? name}`,
            title: `בוטלה הרשמה — ${name}`,
            timestamp: item.cancellation?.cancelled_at,
            page: "cancellations"
        });
    }

    for (const request of overview.pendingRequests ?? []) {
        const name = request.full_name || "משתתף";

        items.push({
            id: `reg-${request.registrationId || request.participant_id || request.id || name}`,
            title: `בקשת הרשמה חדשה — ${name}`,
            timestamp: request.registered_at ?? request.created_at,
            page: "registrations"
        });
    }

    for (const activity of overview.upcomingActivities ?? []) {
        items.push({
            id: `activity-${activity.id}`,
            title: `פעילות קרובה — ${activity.data?.name || "פעילות"}`,
            timestamp: activity.data?.start_date,
            page: "activities"
        });
    }

    return items
        .sort((a, b) => getTimestampMillis(b.timestamp) - getTimestampMillis(a.timestamp))
        .slice(0, 6);
}

export const RECENT_UPDATES_PLACEHOLDERS = [
    { id: "placeholder-message", title: "נשלחה הודעה למשתתפים", timeLabel: "לפני שעה" },
    { id: "placeholder-cancel", title: "בוטלה הרשמה", timeLabel: "לפני יומיים" },
    { id: "placeholder-activity", title: "פעילות חדשה נוספה", timeLabel: "לפני 3 ימים" }
];
