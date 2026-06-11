import {
    PROGRAM_60_PLUS_MINUS_ID,
    formatProgramTitle
} from "./programConstants";

export function is60PlusProgram(programId) {
    return programId === PROGRAM_60_PLUS_MINUS_ID;
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
