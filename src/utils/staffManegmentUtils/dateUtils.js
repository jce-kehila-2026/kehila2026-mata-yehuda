import { Timestamp } from "firebase/firestore";

export const HEBREW_WEEKDAYS = [
    "יום ראשון",
    "יום שני",
    "יום שלישי",
    "יום רביעי",
    "יום חמישי",
    "יום שישי",
    "שבת"
];

export const HEBREW_WEEKDAYS_SHORT = [
    "ראשון",
    "שני",
    "שלישי",
    "רביעי",
    "חמישי",
    "שישי",
    "שבת"
];

export function toActivityDate(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    try {
        if (typeof value.toDate === "function") {
            const date = value.toDate();

            if (date instanceof Date && !Number.isNaN(date.getTime())) {
                return date;
            }

            return null;
        }

        if (typeof value === "object" && typeof value.seconds === "number") {
            const date = new Date(value.seconds * 1000);

            return Number.isNaN(date.getTime()) ? null : date;
        }

        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }

        if (typeof value === "number") {
            const date = new Date(value);

            return Number.isNaN(date.getTime()) ? null : date;
        }

        if (typeof value === "string") {
            const trimmed = value.trim();

            if (!trimmed) {
                return null;
            }

            const parsed = new Date(trimmed);

            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
    } catch {
        return null;
    }

    return null;
}

export function getHebrewWeekday(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return "";
    }

    return HEBREW_WEEKDAYS[date.getDay()] || "";
}

export function formatIsraeliDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return "";
    }

    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export function getHebrewWeekdayShort(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return "";
    }

    return HEBREW_WEEKDAYS_SHORT[date.getDay()] || "";
}

export function getActivityWeekdaySortValue(value) {
    try {
        const date = toActivityDate(value);

        if (!date) {
            return null;
        }

        return date.getDay();
    } catch {
        return null;
    }
}

export function formatActivityWeekday(value) {
    try {
        const date = toActivityDate(value);

        if (!date) {
            return "-";
        }

        const weekday = getHebrewWeekdayShort(date);

        return weekday || "-";
    } catch {
        return "-";
    }
}

export function formatActivityDateOnly(value) {
    try {
        const date = toActivityDate(value);

        if (!date) {
            return "-";
        }

        const formattedDate = formatIsraeliDate(date);

        return formattedDate || "-";
    } catch {
        return "-";
    }
}

export function getDayOfWeekFromActivityDate(startDate, startTime = "00:00") {
    if (!startDate) {
        return "";
    }

    const date = new Date(`${startDate}T${startTime || "00:00"}`);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return getHebrewWeekday(date);
}

export function formatActivityDateWithWeekday(value) {
    const weekday = formatActivityWeekday(value);
    const formattedDate = formatActivityDateOnly(value);

    if (weekday === "-" || formattedDate === "-") {
        return "-";
    }

    const date = toActivityDate(value);
    const weekdayLong = date ? getHebrewWeekday(date) : weekday;

    return `${weekdayLong}, ${formattedDate}`;
}

export function formatDate(value) {
    if (!value) return "";

    if (value.toDate) {
        return value.toDate().toISOString().split("T")[0];
    }

    if (value.seconds) {
        return new Date(value.seconds * 1000).toISOString().split("T")[0];
    }

    return value;
}

export function parseBirthDateToTimestamp(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Timestamp) {
        return value;
    }

    if (value.toDate) {
        return Timestamp.fromDate(value.toDate());
    }

    if (value.seconds) {
        return new Timestamp(value.seconds, value.nanoseconds || 0);
    }

    const trimmed = typeof value === "string" ? value.trim() : "";

    if (!trimmed) {
        return null;
    }

    const parsed = new Date(trimmed);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return Timestamp.fromDate(parsed);
}

export function formatTime(value) {
    if (!value) return "";

    let date;

    if (value.toDate) {
        date = value.toDate();
    } else if (value.seconds) {
        date = new Date(value.seconds * 1000);
    } else {
        return value;
    }

    return date.toTimeString().slice(0, 5);
}

export function startOfLocalDay(date) {
    if (!date) {
        return null;
    }

    const value = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(value.getTime())) {
        return null;
    }

    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function parseLocalDateInput(dateStr) {
    if (!dateStr) {
        return null;
    }

    const parts = String(dateStr).trim().split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return null;
    }

    const [year, month, day] = parts;

    return new Date(year, month - 1, day);
}