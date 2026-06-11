import { startOfLocalDay, toActivityDate } from "./dateUtils";

export const HEBREW_WEEKDAY_HEADERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

export function getActivityLocalDayKey(startDate) {
    const date = toActivityDate(startDate);

    if (!date) {
        return null;
    }

    return startOfLocalDay(date).getTime();
}

export function groupActivitiesByLocalDay(activities = []) {
    const map = new Map();

    activities.forEach((activity) => {
        const key = getActivityLocalDayKey(activity.data?.start_date);

        if (key == null) {
            return;
        }

        if (!map.has(key)) {
            map.set(key, []);
        }

        map.get(key).push(activity);
    });

    return map;
}

export function getActivitiesInMonth(activities = [], year, month) {
    return activities.filter((activity) => {
        const date = toActivityDate(activity.data?.start_date);

        if (!date) {
            return false;
        }

        return date.getFullYear() === year && date.getMonth() === month;
    });
}

export function buildMonthCalendarCells(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay.getDay();
    const cells = [];

    for (let index = 0; index < startOffset; index += 1) {
        cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(day);
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return cells;
}

export function formatHebrewMonthYear(date) {
    return new Intl.DateTimeFormat("he-IL", {
        month: "long",
        year: "numeric"
    }).format(date);
}

export function getUpcomingActivities(activities = [], limit = 2, now = new Date()) {
    const todayStart = startOfLocalDay(now)?.getTime() ?? 0;

    return [...activities]
        .filter((activity) => {
            const date = toActivityDate(activity.data?.start_date);

            if (!date) {
                return false;
            }

            return startOfLocalDay(date).getTime() >= todayStart;
        })
        .sort((left, right) => {
            const leftDate = toActivityDate(left.data?.start_date);
            const rightDate = toActivityDate(right.data?.start_date);

            if (!leftDate || !rightDate) {
                return 0;
            }

            return leftDate.getTime() - rightDate.getTime();
        })
        .slice(0, limit);
}

export function getNextUpcomingActivity(activities = [], now = new Date()) {
    return getUpcomingActivities(activities, 1, now)[0] ?? null;
}
