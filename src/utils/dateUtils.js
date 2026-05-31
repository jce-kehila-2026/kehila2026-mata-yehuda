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