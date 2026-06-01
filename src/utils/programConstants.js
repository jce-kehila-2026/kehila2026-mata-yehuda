export const DAY_CENTER_ID = "day_center";
export const DAY_CENTER_NAME = "מרכז יום";

export const PROGRAM_60_PLUS_MINUS_ID = "60_plus_minus";
/** Shown in the UI for the 60+/- fixed program (Firestore title may differ). */
export const PROGRAM_60_PLUS_MINUS_DISPLAY_NAME = "60+-";
export const PROGRAM_60_PLUS_MINUS_NAME = PROGRAM_60_PLUS_MINUS_DISPLAY_NAME;

export const SUPPORTIVE_COMMUNITY_ID = "supportive_community";
export const SUPPORTIVE_COMMUNITY_NAME = "קהילה תומכת";

export const FIXED_PROGRAMS = [
    {
        id: DAY_CENTER_ID,
        title: DAY_CENTER_NAME,
        legacyDayCenter: true
    },
    {
        id: PROGRAM_60_PLUS_MINUS_ID,
        title: PROGRAM_60_PLUS_MINUS_NAME
    },
    {
        id: SUPPORTIVE_COMMUNITY_ID,
        title: SUPPORTIVE_COMMUNITY_NAME
    }
];

export const FIXED_PROGRAM_IDS = FIXED_PROGRAMS.map((program) => program.id);

/** Old Firestore doc ids — excluded from the list (replaced by FIXED_PROGRAM_IDS). */
export const DEPRECATED_FIXED_PROGRAM_IDS = ["program_60_plus"];

export function isDeprecatedFixedProgramId(programId) {
    return DEPRECATED_FIXED_PROGRAM_IDS.includes(programId);
}

export function isFixedProgramId(programId) {
    return FIXED_PROGRAM_IDS.includes(programId);
}

export function isFixedProgram(program) {
    if (!program) {
        return false;
    }

    if (isFixedProgramId(program.id)) {
        return true;
    }

    if (program.is_system_program === true) {
        return true;
    }

    if (program.is_day_center === true) {
        return true;
    }

    return false;
}

export function getFixedProgramById(programId) {
    return FIXED_PROGRAMS.find((program) => program.id === programId);
}

export function formatProgramTitle(program) {
    if (!program) {
        return "";
    }

    if (program.id === PROGRAM_60_PLUS_MINUS_ID) {
        return PROGRAM_60_PLUS_MINUS_DISPLAY_NAME;
    }

    return program.title || "";
}

export function getFixedProgramTitle(programId) {
    if (programId === PROGRAM_60_PLUS_MINUS_ID) {
        return PROGRAM_60_PLUS_MINUS_DISPLAY_NAME;
    }

    return getFixedProgramById(programId)?.title || "";
}

export function createFixedProgramPlaceholder(programId) {
    const fixedProgram = getFixedProgramById(programId);

    if (!fixedProgram) {
        return null;
    }

    return {
        id: fixedProgram.id,
        title: fixedProgram.title,
        description: "",
        image_url: "",
        is_system_program: true,
        ...(fixedProgram.legacyDayCenter ? { is_day_center: true } : {})
    };
}

export function getProgramsPageTitle(editingId) {
    if (!editingId) {
        return "הוספת תוכנית חדשה";
    }

    const fixedTitle = getFixedProgramTitle(editingId);

    if (fixedTitle) {
        return `עריכת ${fixedTitle}`;
    }

    return "עריכת תוכנית";
}

export function getProgramUpdateSuccessMessage(editingId) {
    const fixedTitle = getFixedProgramTitle(editingId);

    if (fixedTitle) {
        return `${fixedTitle} עודכן בהצלחה`;
    }

    return "התוכנית עודכנה בהצלחה";
}

// Backward-compatible alias
export function isDayCenterEntry(program) {
    return isFixedProgram(program);
}
