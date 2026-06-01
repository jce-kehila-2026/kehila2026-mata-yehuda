import { isActivityRequiredForProgram } from "../../../utils/programConstants";
import {
    applyProgramSelection,
    applyActivitySelection
} from "../../../utils/programSelectionHelpers";

export { applyProgramSelection, applyActivitySelection };
export { isActivityRequiredForProgram } from "../../../utils/programConstants";

/** @deprecated Phase 1 — use isActivityBasedProgram; kept for RequestCard until Phase 2 */
export { is60PlusProgram } from "../../../utils/programSelectionHelpers";

export const emptyParticipantForm = {
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
    program_id: "",
    program_title: "",
    activity_id: "",
    activity_name: ""
};

export function participantToForm(participant) {
    return {
        first_name: participant?.first_name || "",
        last_name: participant?.last_name || "",
        id_number: participant?.id_number || "",
        birth_date: participant?.birth_date || "",
        gender: participant?.gender || "",
        phone: participant?.phone || "",
        address: participant?.address || "",
        emergency_number: participant?.emergency_number || "",
        medical_notes: participant?.medical_notes || "",
        mobility_limitations: participant?.mobility_limitations || "",
        program_id: participant?.program_id || "",
        program_title: participant?.program_title || "",
        activity_id: participant?.activity_id || "",
        activity_name: participant?.activity_name || ""
    };
}

export function validateParticipantForm(form, programs = []) {
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
