import {
    PROGRAM_60_PLUS_MINUS_ID,
    formatProgramTitle
} from "../../utils/programConstants";

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

export function is60PlusProgram(programId) {
    return programId === PROGRAM_60_PLUS_MINUS_ID;
}

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

export function applyProgramSelection(programId, programs) {
    const program = programs.find((item) => item.id === programId);
    const programTitle = program ? formatProgramTitle(program) : "";

    return {
        program_id: programId,
        program_title: programTitle,
        ...(is60PlusProgram(programId)
            ? {}
            : { activity_id: "", activity_name: "" })
    };
}

export function applyActivitySelection(activityId, activities) {
    const activity = activities.find((item) => item.id === activityId);

    return {
        activity_id: activityId,
        activity_name: activity?.data?.name || ""
    };
}

export function validateParticipantForm(form) {
    if (!form.id_number.trim()) {
        return "יש להזין תעודת זהות";
    }

    if (!form.phone.trim()) {
        return "יש להזין טלפון";
    }

    if (!form.program_id) {
        return "יש לבחור תוכנית";
    }

    if (is60PlusProgram(form.program_id) && !form.activity_id) {
        return "יש לבחור פעילות";
    }

    return "";
}
