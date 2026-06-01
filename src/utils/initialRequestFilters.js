import {
    DAY_CENTER_ID,
    getProgramTypeById,
    PROGRAM_TYPE_DAY_CENTER,
    PROGRAM_TYPE_ACTIVITY_BASED,
    PROGRAM_TYPE_SUPPORTIVE_COMMUNITY,
    resolveCanonicalProgramId
} from "./programConstants";

export const REGISTRATION_STATUS_COMPLETED = "הושלם";

function isCompleted(status) {
    return status === REGISTRATION_STATUS_COMPLETED;
}

export function shouldShowParticipantAsInitialRequest(participant) {
    const programId =
        participant?.program_id?.trim() ||
        participant?.registration?.program_id?.trim() ||
        "";

    const hasFields = Boolean(
        participant?.id_number?.trim() && participant?.phone?.trim() && programId
    );

    if (!hasFields) {
        return false;
    }

    const programType = getProgramTypeById(programId);

    if (programType === PROGRAM_TYPE_DAY_CENTER) {
        return true;
    }

    if (programType === PROGRAM_TYPE_ACTIVITY_BASED) {
        return true;
    }

    if (programType === PROGRAM_TYPE_SUPPORTIVE_COMMUNITY) {
        return true;
    }

    return true;
}

export function explainRegistrationRequestVisibility(registration) {
    const programId = resolveCanonicalProgramId(registration?.program_id || "");
    const activityId = String(registration?.activity_id || "").trim();

    if (!programId && !activityId) {
        return { shouldShow: false, reason: "missing_program_id" };
    }

    if (programId === DAY_CENTER_ID) {
        return { shouldShow: true, reason: "day_center_always_visible" };
    }

    const programType = getProgramTypeById(programId);

    if (programType === PROGRAM_TYPE_DAY_CENTER) {
        return { shouldShow: true, reason: "day_center_always_visible" };
    }

    const status = registration?.registration_status || "";

    if (programType === PROGRAM_TYPE_ACTIVITY_BASED) {
        return {
            shouldShow: !isCompleted(status),
            reason: isCompleted(status)
                ? "activity_based_completed"
                : "activity_based_pending"
        };
    }

    if (programType === PROGRAM_TYPE_SUPPORTIVE_COMMUNITY) {
        return {
            shouldShow: !isCompleted(status),
            reason: isCompleted(status)
                ? "supportive_community_completed"
                : "supportive_community_pending"
        };
    }

    return {
        shouldShow: !isCompleted(status),
        reason: isCompleted(status) ? "unknown_program_completed" : "unknown_program_pending"
    };
}

export function shouldShowRegistrationAsInitialRequest(registration) {
    return explainRegistrationRequestVisibility(registration).shouldShow;
}

export function hasRequiredRequestDisplayFields(request) {
    const idNumber = String(request?.id_number ?? "").trim();
    const phone = String(request?.phone ?? "").trim();
    const programId = String(request?.program_id ?? "").trim();

    return Boolean(idNumber && phone && programId);
}
