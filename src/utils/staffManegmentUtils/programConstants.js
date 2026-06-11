export const PROGRAM_TYPE_DAY_CENTER = "day_center";
export const PROGRAM_TYPE_ACTIVITY_BASED = "activity_based";
export const PROGRAM_TYPE_SUPPORTIVE_COMMUNITY = "supportive_community";

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
        type: PROGRAM_TYPE_DAY_CENTER,
        legacyDayCenter: true
    },
    {
        id: PROGRAM_60_PLUS_MINUS_ID,
        title: PROGRAM_60_PLUS_MINUS_NAME,
        type: PROGRAM_TYPE_ACTIVITY_BASED
    },
    {
        id: SUPPORTIVE_COMMUNITY_ID,
        title: SUPPORTIVE_COMMUNITY_NAME,
        type: PROGRAM_TYPE_SUPPORTIVE_COMMUNITY
    }
];

export const FIXED_PROGRAM_IDS = FIXED_PROGRAMS.map((program) => program.id);

const PROGRAM_ID_TYPE_MAP = {
    [DAY_CENTER_ID]: PROGRAM_TYPE_DAY_CENTER,
    [PROGRAM_60_PLUS_MINUS_ID]: PROGRAM_TYPE_ACTIVITY_BASED,
    [SUPPORTIVE_COMMUNITY_ID]: PROGRAM_TYPE_SUPPORTIVE_COMMUNITY
};

export function getProgramType(program) {
    if (!program) {
        return "";
    }

    if (program.type) {
        return program.type;
    }

    if (program.is_day_center === true) {
        return PROGRAM_TYPE_DAY_CENTER;
    }

    if (program.id && PROGRAM_ID_TYPE_MAP[program.id]) {
        return PROGRAM_ID_TYPE_MAP[program.id];
    }

    return "";
}

export function getProgramTypeById(programId, programs) {
    if (!programId) {
        return "";
    }

    if (programs?.length) {
        const program = programs.find((item) => item.id === programId);

        if (program) {
            return getProgramType(program);
        }
    }

    return PROGRAM_ID_TYPE_MAP[programId] || "";
}

export function isDayCenterProgram(program) {
    return getProgramType(program) === PROGRAM_TYPE_DAY_CENTER;
}

export function isActivityBasedProgram(program) {
    return getProgramType(program) === PROGRAM_TYPE_ACTIVITY_BASED;
}

export function isActivityRequiredForProgram(programId, programs = []) {
    if (!programId?.trim()) {
        return false;
    }

    const selectedProgram = programs.find((program) => program.id === programId);

    if (selectedProgram) {
        return isActivityBasedProgram(selectedProgram);
    }

    const canonicalProgramId = resolveCanonicalProgramId(programId);

    return (
        getProgramTypeById(canonicalProgramId, programs) ===
        PROGRAM_TYPE_ACTIVITY_BASED
    );
}

export function isSupportiveCommunityProgram(program) {
    return getProgramType(program) === PROGRAM_TYPE_SUPPORTIVE_COMMUNITY;
}

/** Old Firestore doc ids — excluded from the list (replaced by FIXED_PROGRAM_IDS). */
export const DEPRECATED_FIXED_PROGRAM_IDS = ["program_60_plus"];

/** Legacy programs doc id that should map to PROGRAM_60_PLUS_MINUS_ID in registrations. */
export const LEGACY_ACTIVITY_PROGRAM_DOC_ID = "60+-";

export function resolveCanonicalProgramId(programId) {
    const trimmedId = programId?.trim() || "";

    if (!trimmedId) {
        return "";
    }

    if (
        trimmedId === LEGACY_ACTIVITY_PROGRAM_DOC_ID ||
        trimmedId === "program_60_plus"
    ) {
        return PROGRAM_60_PLUS_MINUS_ID;
    }

    return trimmedId;
}

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

const SIXTY_PLUS_TITLE_VARIANTS = new Set([
    "60+-",
    "60-+",
    "-+60",
    "+-60",
    "60+",
    "+60",
    "60-",
    "-60"
]);

export function isSixtyPlusProgramTitle(title) {
    const normalized = String(title ?? "").trim();

    if (!normalized) {
        return false;
    }

    return (
        SIXTY_PLUS_TITLE_VARIANTS.has(normalized) ||
        /^[-+]?60[-+]?$/.test(normalized)
    );
}

export function shouldDisplayProgramTitleLtr(title) {
    return (
        title === PROGRAM_60_PLUS_MINUS_DISPLAY_NAME ||
        isSixtyPlusProgramTitle(title)
    );
}

export function formatProgramTitle(program) {
    if (!program) {
        return "";
    }

    const canonicalId = resolveCanonicalProgramId(program.id);

    if (
        canonicalId === PROGRAM_60_PLUS_MINUS_ID ||
        isSixtyPlusProgramTitle(program.title)
    ) {
        return PROGRAM_60_PLUS_MINUS_DISPLAY_NAME;
    }

    if (canonicalId === DAY_CENTER_ID) {
        return program.title || DAY_CENTER_NAME;
    }

    if (canonicalId === SUPPORTIVE_COMMUNITY_ID) {
        return program.title || SUPPORTIVE_COMMUNITY_NAME;
    }

    return program.title || "";
}

export function getFixedProgramTitle(programId) {
    const canonicalId = resolveCanonicalProgramId(programId);

    if (canonicalId === PROGRAM_60_PLUS_MINUS_ID) {
        return PROGRAM_60_PLUS_MINUS_DISPLAY_NAME;
    }

    return getFixedProgramById(canonicalId)?.title || "";
}

export function resolveProgramDisplayTitle(program, programId = "") {
    const canonicalId = resolveCanonicalProgramId(program?.id || programId);

    if (program) {
        const formatted = formatProgramTitle(program);

        if (formatted) {
            return formatted;
        }
    }

    if (canonicalId) {
        return getFixedProgramTitle(canonicalId) || canonicalId;
    }

    return "";
}

export function createFixedProgramPlaceholder(programId) {
    const fixedProgram = getFixedProgramById(programId);

    if (!fixedProgram) {
        return null;
    }

    return {
        id: fixedProgram.id,
        title: fixedProgram.title,
        type: fixedProgram.type,
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
