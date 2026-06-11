import {
    is60PlusProgram,
    applyProgramSelection,
    applyActivitySelection
} from "../../../utils/programSelectionHelpers";

export { is60PlusProgram, applyProgramSelection, applyActivitySelection };

export const emptyRegistrationForm = {
    participant_id: "",
    program_id: "",
    activity_id: "",
    payment_method: "",
    payment_status: "",
    registration_status: ""
};

export function registrationToForm(registration) {
    const programId =
        registration?.program_id ||
        registration?.programId ||
        resolveLegacyProgramId(registration);

    const activityId =
        registration?.activity_id || registration?.activityId || "";

    return {
        participant_id:
            registration?.participant_id || registration?.participantId || "",
        program_id: programId,
        activity_id: activityId,
        payment_method:
            registration?.payment_method || registration?.paymentMethod || "",
        payment_status:
            registration?.payment_status || registration?.paymentStatus || "",
        registration_status:
            registration?.registration_status ||
            registration?.registrationStatus ||
            ""
    };
}

export function resolveLegacyProgramId(registration) {
    const programId = registration?.program_id || registration?.programId;

    if (programId) {
        return programId;
    }

    const activityId = registration?.activity_id || registration?.activityId;

    if (activityId) {
        return "60_plus_minus";
    }

    return "";
}

export function validateRegistrationForm(form) {
    if (!form.participant_id.trim()) {
        return "יש לבחור משתתף";
    }

    if (!form.program_id) {
        return "יש לבחור תוכנית";
    }

    if (is60PlusProgram(form.program_id) && !form.activity_id) {
        return "יש לבחור פעילות";
    }

    return "";
}
