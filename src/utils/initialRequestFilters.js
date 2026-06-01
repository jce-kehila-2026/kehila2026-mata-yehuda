import {
    getProgramTypeById,
    PROGRAM_TYPE_DAY_CENTER,
    PROGRAM_TYPE_ACTIVITY_BASED,
    PROGRAM_TYPE_SUPPORTIVE_COMMUNITY
} from "./programConstants";

export const REGISTRATION_STATUS_COMPLETED = "הושלם";

function isCompleted(status) {
    return status === REGISTRATION_STATUS_COMPLETED;
}

export function shouldShowParticipantAsInitialRequest(participant) {
    const hasFields = Boolean(
        participant?.id_number?.trim() &&
            participant?.phone?.trim() &&
            participant?.program_id?.trim()
    );

    if (!hasFields) {
        return false;
    }

    const programType = getProgramTypeById(participant.program_id);

    if (programType === PROGRAM_TYPE_DAY_CENTER) {
        return true;
    }

    if (programType === PROGRAM_TYPE_ACTIVITY_BASED) {
        return !isCompleted(participant.registration_status);
    }

    if (programType === PROGRAM_TYPE_SUPPORTIVE_COMMUNITY) {
        return !isCompleted(participant.registration_status);
    }

    return !isCompleted(participant.registration_status);
}

export function shouldShowRegistrationAsInitialRequest(registration) {
    const programId = registration.program_id;

    if (!programId && !registration.activity_id) {
        return false;
    }

    const programType = getProgramTypeById(programId);

    if (programType === PROGRAM_TYPE_DAY_CENTER) {
        return true;
    }

    if (programType === PROGRAM_TYPE_ACTIVITY_BASED) {
        return !isCompleted(registration.registration_status);
    }

    if (programType === PROGRAM_TYPE_SUPPORTIVE_COMMUNITY) {
        return !isCompleted(registration.registration_status);
    }

    return !isCompleted(registration.registration_status);
}
