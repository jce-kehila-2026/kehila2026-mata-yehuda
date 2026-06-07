export const ACTIVITY_DISPLAY_STATUS = {
    OPEN: "open",
    CLOSED: "closed",
    ENDED: "ended"
};

export const ACTIVITY_DISPLAY_STATUS_LABELS = {
    [ACTIVITY_DISPLAY_STATUS.OPEN]: "פתוח",
    [ACTIVITY_DISPLAY_STATUS.CLOSED]: "סגור",
    [ACTIVITY_DISPLAY_STATUS.ENDED]: "הסתיים"
};

export const ACTIVITY_STATUS_BADGE_CLASS = {
    [ACTIVITY_DISPLAY_STATUS.OPEN]: "activity-status-badge activity-status-badge--open",
    [ACTIVITY_DISPLAY_STATUS.CLOSED]:
        "activity-status-badge activity-status-badge--closed",
    [ACTIVITY_DISPLAY_STATUS.ENDED]: "activity-status-badge activity-status-badge--ended"
};

function toActivityDate(value) {
    if (!value) {
        return null;
    }

    if (value.toDate) {
        return value.toDate();
    }

    if (value.seconds) {
        return new Date(value.seconds * 1000);
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hasActivityDatePassed(data, now) {
    const activityEnd = toActivityDate(data.end_date);
    const activityStart = toActivityDate(data.start_date);
    const activityDate = activityEnd || activityStart;

    return Boolean(activityDate && activityDate.getTime() < now.getTime());
}

function hasRegistrationDeadlinePassed(data, now) {
    const registrationDeadline = toActivityDate(data.registration_deadline);

    return Boolean(
        registrationDeadline && registrationDeadline.getTime() < now.getTime()
    );
}

export function getActivityDisplayStatus(data, now = new Date()) {
    if (!data) {
        return {
            status: ACTIVITY_DISPLAY_STATUS.CLOSED,
            label: ACTIVITY_DISPLAY_STATUS_LABELS[ACTIVITY_DISPLAY_STATUS.CLOSED],
            badgeClass: ACTIVITY_STATUS_BADGE_CLASS[ACTIVITY_DISPLAY_STATUS.CLOSED]
        };
    }

    if (data.is_open === false) {
        return {
            status: ACTIVITY_DISPLAY_STATUS.CLOSED,
            label: ACTIVITY_DISPLAY_STATUS_LABELS[ACTIVITY_DISPLAY_STATUS.CLOSED],
            badgeClass: ACTIVITY_STATUS_BADGE_CLASS[ACTIVITY_DISPLAY_STATUS.CLOSED]
        };
    }

    if (hasActivityDatePassed(data, now)) {
        return {
            status: ACTIVITY_DISPLAY_STATUS.ENDED,
            label: ACTIVITY_DISPLAY_STATUS_LABELS[ACTIVITY_DISPLAY_STATUS.ENDED],
            badgeClass: ACTIVITY_STATUS_BADGE_CLASS[ACTIVITY_DISPLAY_STATUS.ENDED]
        };
    }

    if (hasRegistrationDeadlinePassed(data, now)) {
        return {
            status: ACTIVITY_DISPLAY_STATUS.CLOSED,
            label: ACTIVITY_DISPLAY_STATUS_LABELS[ACTIVITY_DISPLAY_STATUS.CLOSED],
            badgeClass: ACTIVITY_STATUS_BADGE_CLASS[ACTIVITY_DISPLAY_STATUS.CLOSED]
        };
    }

    return {
        status: ACTIVITY_DISPLAY_STATUS.OPEN,
        label: ACTIVITY_DISPLAY_STATUS_LABELS[ACTIVITY_DISPLAY_STATUS.OPEN],
        badgeClass: ACTIVITY_STATUS_BADGE_CLASS[ACTIVITY_DISPLAY_STATUS.OPEN]
    };
}

export function isActivityDisplayOpen(data, now = new Date()) {
    return getActivityDisplayStatus(data, now).status === ACTIVITY_DISPLAY_STATUS.OPEN;
}

export function matchesActivityOpenFilter(data, openFilter, now = new Date()) {
    if (!openFilter) {
        return true;
    }

    const { status } = getActivityDisplayStatus(data, now);

    if (openFilter === "open") {
        return status === ACTIVITY_DISPLAY_STATUS.OPEN;
    }

    if (openFilter === "closed") {
        return status !== ACTIVITY_DISPLAY_STATUS.OPEN;
    }

    return true;
}

export function getActivityStatusSortValue(data, now = new Date()) {
    const { status } = getActivityDisplayStatus(data, now);

    switch (status) {
        case ACTIVITY_DISPLAY_STATUS.OPEN:
            return 2;
        case ACTIVITY_DISPLAY_STATUS.CLOSED:
            return 1;
        case ACTIVITY_DISPLAY_STATUS.ENDED:
            return 0;
        default:
            return -1;
    }
}
