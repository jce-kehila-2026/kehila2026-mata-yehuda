import { parseLocalDateInput, startOfLocalDay, toActivityDate } from "./dateUtils";

export const ACTIVITY_DISPLAY_STATUS = {
    OPEN: "open",
    CLOSED: "closed",
    ENDED: "ended",
    UNKNOWN: "unknown"
};

export const ACTIVITY_DISPLAY_STATUS_LABELS = {
    [ACTIVITY_DISPLAY_STATUS.OPEN]: "פתוח",
    [ACTIVITY_DISPLAY_STATUS.CLOSED]: "סגור",
    [ACTIVITY_DISPLAY_STATUS.ENDED]: "הסתיים",
    [ACTIVITY_DISPLAY_STATUS.UNKNOWN]: "לא ידוע"
};

export const ACTIVITY_STATUS_BADGE_CLASS = {
    [ACTIVITY_DISPLAY_STATUS.OPEN]: "activity-status-badge activity-status-badge--open",
    [ACTIVITY_DISPLAY_STATUS.CLOSED]:
        "activity-status-badge activity-status-badge--closed",
    [ACTIVITY_DISPLAY_STATUS.ENDED]: "activity-status-badge activity-status-badge--ended",
    [ACTIVITY_DISPLAY_STATUS.UNKNOWN]:
        "activity-status-badge activity-status-badge--unknown"
};

export const REGISTRATION_AVAILABILITY = {
    OPEN: "open",
    CLOSED: "closed",
    UNKNOWN: "unknown"
};

export const REGISTRATION_AVAILABILITY_LABELS = {
    [REGISTRATION_AVAILABILITY.OPEN]: "פתוח",
    [REGISTRATION_AVAILABILITY.CLOSED]: "סגור",
    [REGISTRATION_AVAILABILITY.UNKNOWN]: "לא ידוע"
};

function hasActivityDatePassed(data, now) {
    const activityEnd = toActivityDate(data.end_date);
    const activityStart = toActivityDate(data.start_date);
    const activityDate = activityEnd || activityStart;

    return Boolean(activityDate && activityDate.getTime() < now.getTime());
}

function getRegistrationDeadlineDay(data) {
    const registrationDeadline = toActivityDate(data?.registration_deadline);

    if (!registrationDeadline) {
        return null;
    }

    return startOfLocalDay(registrationDeadline);
}

export function getRegistrationAvailability(data, now = new Date()) {
    const deadlineDay = getRegistrationDeadlineDay(data);
    const today = startOfLocalDay(now);

    if (deadlineDay && today) {
        return deadlineDay.getTime() >= today.getTime()
            ? REGISTRATION_AVAILABILITY.OPEN
            : REGISTRATION_AVAILABILITY.CLOSED;
    }

    if (data?.is_open === true) {
        return REGISTRATION_AVAILABILITY.OPEN;
    }

    if (data?.is_open === false) {
        return REGISTRATION_AVAILABILITY.CLOSED;
    }

    return REGISTRATION_AVAILABILITY.UNKNOWN;
}

export function getRegistrationAvailabilityLabel(data, now = new Date()) {
    return REGISTRATION_AVAILABILITY_LABELS[getRegistrationAvailability(data, now)];
}

export function isRegistrationOpenForDeadlineInput(dateStr, now = new Date()) {
    const deadlineDay = parseLocalDateInput(dateStr);
    const today = startOfLocalDay(now);

    if (!deadlineDay || !today) {
        return false;
    }

    return deadlineDay.getTime() >= today.getTime();
}

export function getActivityDisplayStatus(data, now = new Date()) {
    if (!data) {
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

    const registrationAvailability = getRegistrationAvailability(data, now);

    if (registrationAvailability === REGISTRATION_AVAILABILITY.CLOSED) {
        return {
            status: ACTIVITY_DISPLAY_STATUS.CLOSED,
            label: ACTIVITY_DISPLAY_STATUS_LABELS[ACTIVITY_DISPLAY_STATUS.CLOSED],
            badgeClass: ACTIVITY_STATUS_BADGE_CLASS[ACTIVITY_DISPLAY_STATUS.CLOSED]
        };
    }

    if (registrationAvailability === REGISTRATION_AVAILABILITY.UNKNOWN) {
        return {
            status: ACTIVITY_DISPLAY_STATUS.UNKNOWN,
            label: ACTIVITY_DISPLAY_STATUS_LABELS[ACTIVITY_DISPLAY_STATUS.UNKNOWN],
            badgeClass: ACTIVITY_STATUS_BADGE_CLASS[ACTIVITY_DISPLAY_STATUS.UNKNOWN]
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
        case ACTIVITY_DISPLAY_STATUS.UNKNOWN:
            return 1;
        case ACTIVITY_DISPLAY_STATUS.CLOSED:
            return 1;
        case ACTIVITY_DISPLAY_STATUS.ENDED:
            return 0;
        default:
            return -1;
    }
}
