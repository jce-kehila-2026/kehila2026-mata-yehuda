import {
    DAY_CENTER_ID,
    getProgramTypeById,
    PROGRAM_60_PLUS_MINUS_ID,
    PROGRAM_TYPE_ACTIVITY_BASED,
    PROGRAM_TYPE_DAY_CENTER,
    resolveCanonicalProgramId
} from "./programConstants";

export const REGISTRATION_STATUS_PENDING = "ממתין";
export const REGISTRATION_STATUS_COMPLETED = "הושלם";

export function formatParticipantDisplayName(participant) {
    const firstName = participant?.first_name || "";
    const lastName = participant?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "—";
}

export function isPendingRegistrationStatus(status) {
    return String(status ?? "").trim() === REGISTRATION_STATUS_PENDING;
}

export function isAllowedPendingRequestProgram(programId) {
    const canonicalId = resolveCanonicalProgramId(programId);
    const programType = getProgramTypeById(canonicalId);

    return (
        programType === PROGRAM_TYPE_DAY_CENTER ||
        programType === PROGRAM_TYPE_ACTIVITY_BASED
    );
}

/**
 * ViewRequests: pending day_center or 60+- registrations only.
 */
export function isPendingRegistrationRequest(registration) {
    if (!registration) {
        return false;
    }

    const status = registration.registration_status || "";

    if (!isPendingRegistrationStatus(status)) {
        return false;
    }

    const programId = resolveCanonicalProgramId(registration.program_id || "");

    if (!programId) {
        return false;
    }

    return isAllowedPendingRequestProgram(programId);
}

/** @deprecated Kept for AddParticipant / exports — not used by ViewRequests. */
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

    return isAllowedPendingRequestProgram(programId);
}

export function hasRequiredRequestDisplayFields(request) {
    const idNumber = String(request?.id_number ?? "").trim();
    const phone = String(request?.phone ?? "").trim();
    const programId = String(request?.program_id ?? "").trim();
    const participantId = String(request?.participant_id ?? request?.id ?? "").trim();

    return Boolean(participantId && idNumber && phone && programId);
}

export function matchesViewRequestsProgramFilter(registration, programFilter) {
    if (!programFilter || programFilter === "all") {
        return true;
    }

    const programId = resolveCanonicalProgramId(registration.program_id || "");

    if (programFilter === DAY_CENTER_ID) {
        return getProgramTypeById(programId) === PROGRAM_TYPE_DAY_CENTER;
    }

    if (programFilter === PROGRAM_60_PLUS_MINUS_ID) {
        return getProgramTypeById(programId) === PROGRAM_TYPE_ACTIVITY_BASED;
    }

    return true;
}

export function matchesViewRequestsActivityFilter(registration, activityId) {
    if (!activityId?.trim()) {
        return true;
    }

    const registrationActivityId = String(registration.activity_id || "").trim();

    return registrationActivityId === activityId.trim();
}
