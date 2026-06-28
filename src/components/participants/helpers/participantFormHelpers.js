import {
    getRegistrationActivityId,
    getRegistrationProgramId
} from "../../../services/staffManegmentServices/registrationService";
import {
    getFixedProgramTitle,
    isActivityRequiredForProgram,
    resolveCanonicalProgramId
} from "../../../utils/staffManegmentUtils/programConstants";
import {
    applyProgramSelection,
    applyActivitySelection
} from "../../../utils/staffManegmentUtils/programSelectionHelpers";
import { formatDate } from "../../../utils/staffManegmentUtils/dateUtils";
import { nameContainsNumber } from "../../../utils/nameValidation";

export { applyProgramSelection, applyActivitySelection };
export { isActivityRequiredForProgram } from "../../../utils/staffManegmentUtils/programConstants";

/** @deprecated Phase 1 — use isActivityBasedProgram; kept for RegistrationCard until Phase 2 */
export { is60PlusProgram } from "../../../utils/staffManegmentUtils/programSelectionHelpers";

/** Fields stored on the participants collection only. */
export const PARTICIPANT_PERSONAL_FIELD_KEYS = [
    "first_name",
    "last_name",
    "id_number",
    "birth_date",
    "gender",
    "phone",
    "address",
    "emergency_number",
    "medical_notes",
    "mobility_limitations",
    "marketing_consent"
];

export const emptyParticipantPersonalFields = {
    first_name: "",
    last_name: "",
    id_number: "",
    birth_date: "",
    gender: "",
    phone: "",
    address: "",
    emergency_number: "",
    medical_notes: "",
    mobility_limitations: "",
    marketing_consent: false
};

export const emptyRegistrationFormFields = {
    program_id: "",
    program_title: "",
    activity_id: "",
    activity_name: "",
    registration_status: ""
};

/** Combined UI form state (personal + registration fields for one screen). */
export const emptyParticipantForm = {
    ...emptyParticipantPersonalFields,
    ...emptyRegistrationFormFields
};

export function participantPersonalToForm(participant) {
    return {
        first_name: participant?.first_name || "",
        last_name: participant?.last_name || "",
        id_number: participant?.id_number || "",
        birth_date: formatDate(participant?.birth_date) || "",
        gender: participant?.gender || "",
        phone: participant?.phone || "",
        address: participant?.address || "",
        emergency_number: participant?.emergency_number || "",
        medical_notes: participant?.medical_notes || "",
        mobility_limitations: participant?.mobility_limitations || "",
        marketing_consent: Boolean(participant?.marketing_consent)
    };
}

function resolveActivityNameFromList(activityId, activities = []) {
    if (!activityId) {
        return "";
    }

    const activity = activities.find((item) => item.id === activityId);

    return activity?.data?.name || activity?.name || "";
}

/**
 * Registration for edit UI: fetched row, embedded participant.registration,
 * or flattened program_id / registrationId from list/request merges.
 */
export function resolveEditParticipantRegistration(
    participant,
    fetchedRegistration = null
) {
    if (fetchedRegistration) {
        return fetchedRegistration;
    }

    const embedded = participant?.registration;

    if (embedded && getRegistrationProgramId(embedded)) {
        return embedded;
    }

    const programId = resolveCanonicalProgramId(
        getRegistrationProgramId(participant) || participant?.program_id || ""
    );
    const activityId =
        getRegistrationActivityId(participant) || participant?.activity_id || "";

    if (programId || participant?.registrationId || embedded?.id) {
        return {
            id: participant?.registrationId || embedded?.id || null,
            participant_id: participant?.id || "",
            program_id: programId || getRegistrationProgramId(embedded),
            activity_id: activityId || getRegistrationActivityId(embedded),
            registration_status:
                participant?.registration_status ||
                embedded?.registration_status ||
                embedded?.registrationStatus ||
                "",
            program_title:
                participant?.program_title || embedded?.program_title || ""
        };
    }

    if (embedded) {
        return embedded;
    }

    return null;
}

export function registrationFieldsToForm(registration, activities = []) {
    if (!registration) {
        return { ...emptyRegistrationFormFields };
    }

    const program_id = resolveCanonicalProgramId(
        getRegistrationProgramId(registration)
    );
    const activity_id = getRegistrationActivityId(registration);

    const registration_status =
        registration.registration_status ??
        registration.registrationStatus ??
        "";

    return {
        program_id,
        program_title:
            registration.program_title || getFixedProgramTitle(program_id),
        activity_id,
        activity_name:
            registration.activity_name ||
            resolveActivityNameFromList(activity_id, activities),
        registration_status: String(registration_status).trim()
    };
}

export function participantToForm(participant, registration = null, activities = []) {
    return buildEditParticipantForm(participant, registration, [], activities);
}

export function buildEditParticipantForm(
    participant,
    registration = null,
    programs = [],
    activities = []
) {
    const form = {
        ...participantPersonalToForm(participant),
        ...registrationFieldsToForm(registration, activities)
    };

    if (!form.program_id || !programs.length) {
        return form;
    }

    const withProgram = {
        ...form,
        ...applyProgramSelection(form.program_id, programs)
    };

    if (!form.activity_id) {
        return withProgram;
    }

    return {
        ...withProgram,
        ...applyActivitySelection(form.activity_id, activities)
    };
}

export function extractParticipantPersonalFields(form) {
    return {
        first_name: form.first_name?.trim() || "",
        last_name: form.last_name?.trim() || "",
        id_number: form.id_number?.trim() || "",
        birth_date: form.birth_date ?? "",
        gender: form.gender?.trim() || "",
        phone: form.phone?.trim() || "",
        address: form.address?.trim() || "",
        emergency_number: form.emergency_number?.trim() || "",
        medical_notes: form.medical_notes?.trim() || "",
        mobility_limitations: form.mobility_limitations?.trim() || "",
        marketing_consent: Boolean(form.marketing_consent)
    };
}

export function validateParticipantForm(form, programs = []) {
    if (nameContainsNumber(form.first_name)) {
        return "שם פרטי אינו יכול להכיל מספרים";
    }

    if (nameContainsNumber(form.last_name)) {
        return "שם משפחה אינו יכול להכיל מספרים";
    }

    if (!form.id_number.trim()) {
        return "יש להזין תעודת זהות";
    }

    if (!form.phone.trim()) {
        return "יש להזין טלפון";
    }

    if (!form.program_id) {
        return "יש לבחור תוכנית";
    }

    if (
        isActivityRequiredForProgram(form.program_id, programs) &&
        !form.activity_id?.trim()
    ) {
        return "יש לבחור פעילות";
    }

    return "";
}
