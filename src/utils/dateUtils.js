import { Timestamp } from "firebase/firestore";

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