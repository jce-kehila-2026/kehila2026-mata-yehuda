import { startOfLocalDay, toActivityDate } from "./dateUtils";
import {
    DAY_CENTER_ID,
    PROGRAM_60_PLUS_MINUS_ID,
    PROGRAM_TYPE_ACTIVITY_BASED,
    PROGRAM_TYPE_DAY_CENTER,
    PROGRAM_TYPE_SUPPORTIVE_COMMUNITY,
    SUPPORTIVE_COMMUNITY_ID,
    getProgramTypeById,
    resolveCanonicalProgramId
} from "./programConstants";
import { getRegistrationFilterKey } from "./participantStatusLabels";
import {
    getRegistrationActivityId,
    resolveRegistrationProgramId
} from "../../services/staffManegmentServices/registrationService";
import { REGISTRATION_STATUS_PENDING } from "./initialRequestFilters";

/** Must match Staff UI targetGroup values and backend `array-contains` queries. */
export const NOTIFICATION_GROUP_ALL = "all";
export const NOTIFICATION_GROUP_DAY_CENTER = "day_center";
export const NOTIFICATION_GROUP_SUPPORTIVE_COMMUNITY = "supportive_community";
export const NOTIFICATION_GROUP_60_PLUS = "60_plus";

const NOTIFICATION_GROUP_ORDER = [
    NOTIFICATION_GROUP_ALL,
    NOTIFICATION_GROUP_DAY_CENTER,
    NOTIFICATION_GROUP_SUPPORTIVE_COMMUNITY,
    NOTIFICATION_GROUP_60_PLUS
];

/**
 * Maps a Firestore program id to the notification segment stored on tokens.
 * 60_plus_minus (activity-based program) maps to the "60_plus" send target.
 */
export function mapProgramIdToNotificationGroup(programId) {
    const canonicalProgramId = resolveCanonicalProgramId(programId);

    if (!canonicalProgramId) {
        return null;
    }

    if (
        canonicalProgramId === DAY_CENTER_ID ||
        getProgramTypeById(canonicalProgramId) === PROGRAM_TYPE_DAY_CENTER
    ) {
        return NOTIFICATION_GROUP_DAY_CENTER;
    }

    if (
        canonicalProgramId === SUPPORTIVE_COMMUNITY_ID ||
        getProgramTypeById(canonicalProgramId) === PROGRAM_TYPE_SUPPORTIVE_COMMUNITY
    ) {
        return NOTIFICATION_GROUP_SUPPORTIVE_COMMUNITY;
    }

    if (
        canonicalProgramId === PROGRAM_60_PLUS_MINUS_ID ||
        getProgramTypeById(canonicalProgramId) === PROGRAM_TYPE_ACTIVITY_BASED
    ) {
        return NOTIFICATION_GROUP_60_PLUS;
    }

    return null;
}

function isRegistrationCancelled(registration) {
    return getRegistrationFilterKey(registration?.registration_status) === "cancelled";
}

/**
 * Pending initial requests should not receive segmented 60+ pushes until approved.
 */
function isRegistrationPendingFor60Plus(registration) {
    const status = String(registration?.registration_status || "").trim();

    return (
        status === REGISTRATION_STATUS_PENDING ||
        getRegistrationFilterKey(status) === "waiting"
    );
}

/**
 * Matches backend 60+ send rules: activity must be open and end_date >= today.
 */
export function is60PlusActivityActiveForNotifications(activity, now = new Date()) {
    const activityData = activity?.data;

    if (!activityData) {
        return false;
    }

    if (activityData.is_open !== true) {
        return false;
    }

    const endDate = toActivityDate(activityData.end_date ?? activityData.endDate);

    if (!endDate) {
        return false;
    }

    const todayStart = startOfLocalDay(now);
    const endDay = startOfLocalDay(endDate);

    return endDay.getTime() >= todayStart.getTime();
}

function registrationQualifiesForNotificationGroup(
    registration,
    group,
    activitiesById,
    now
) {
    if (group === NOTIFICATION_GROUP_60_PLUS) {
        if (isRegistrationPendingFor60Plus(registration)) {
            return false;
        }

        const activityId = getRegistrationActivityId(registration);

        if (!activityId) {
            return false;
        }

        const activity = activitiesById.get(activityId);

        if (!is60PlusActivityActiveForNotifications(activity, now)) {
            return false;
        }
    }

    return true;
}

export function sortNotificationGroups(groups) {
    const uniqueGroups = [...new Set(groups.filter(Boolean))];

    return uniqueGroups.sort((left, right) => {
        const leftIndex = NOTIFICATION_GROUP_ORDER.indexOf(left);
        const rightIndex = NOTIFICATION_GROUP_ORDER.indexOf(right);

        return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
    });
}

/**
 * Builds the `groups` array for notification_tokens from participant registrations.
 * Always includes "all"; adds segment groups for each active, non-cancelled registration.
 */
export function deriveNotificationGroupsFromRegistrations(
    registrations = [],
    activitiesById = new Map(),
    now = new Date()
) {
    const groups = new Set([NOTIFICATION_GROUP_ALL]);

    registrations.forEach((registration) => {
        if (!registration || isRegistrationCancelled(registration)) {
            return;
        }

        const programId = resolveRegistrationProgramId(registration);
        const group = mapProgramIdToNotificationGroup(programId);

        if (!group) {
            return;
        }

        if (
            !registrationQualifiesForNotificationGroup(
                registration,
                group,
                activitiesById,
                now
            )
        ) {
            return;
        }

        groups.add(group);
    });

    return sortNotificationGroups([...groups]);
}
