import { db } from "../../config/firebase";
import {
    addDoc,
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import { normalizeSearchQuery } from "../../utils/staffManegmentUtils/adminListUtils";
import {
    DAY_CENTER_ID,
    DAY_CENTER_NAME,
    FIXED_PROGRAMS,
    FIXED_PROGRAM_IDS,
    createFixedProgramPlaceholder,
    formatProgramTitle,
    getFixedProgramById,
    isDeprecatedFixedProgramId,
    isFixedProgramId
} from "../../utils/staffManegmentUtils/programConstants";

export {
    DAY_CENTER_ID,
    DAY_CENTER_NAME,
    PROGRAM_60_PLUS_MINUS_ID,
    PROGRAM_60_PLUS_MINUS_NAME,
    SUPPORTIVE_COMMUNITY_ID,
    SUPPORTIVE_COMMUNITY_NAME,
    FIXED_PROGRAMS,
    FIXED_PROGRAM_IDS,
    isFixedProgram,
    isFixedProgramId,
    isDayCenterEntry
} from "../../utils/staffManegmentUtils/programConstants";

const programsCollection = collection(db, "programs");
const dayCenterRef = doc(db, "programs", DAY_CENTER_ID);

function fixedProgramRef(programId) {
    return doc(db, "programs", programId);
}

function sortPrograms(programs) {
    return [...programs].sort((a, b) => {
        const aIndex = FIXED_PROGRAM_IDS.indexOf(a.id);
        const bIndex = FIXED_PROGRAM_IDS.indexOf(b.id);
        const aIsFixed = aIndex !== -1;
        const bIsFixed = bIndex !== -1;

        if (aIsFixed && bIsFixed) {
            return aIndex - bIndex;
        }

        if (aIsFixed) {
            return -1;
        }

        if (bIsFixed) {
            return 1;
        }

        return (a.title || "").localeCompare(b.title || "", "he");
    });
}

function buildFixedProgramPayload(programId, { description, image_url }) {
    const fixedProgram = getFixedProgramById(programId);

    return {
        title: fixedProgram?.title || "",
        description: description.trim(),
        image_url: image_url.trim(),
        is_system_program: true,
        ...(fixedProgram?.legacyDayCenter ? { is_day_center: true } : {})
    };
}

export async function fetchDayCenter() {
    const snap = await getDoc(dayCenterRef);

    if (!snap.exists()) {
        return {
            title: DAY_CENTER_NAME,
            description: "",
            image_url: ""
        };
    }

    const data = snap.data();
    return {
        title: data.title || DAY_CENTER_NAME,
        description: data.description || "",
        image_url: data.image_url || ""
    };
}

export async function saveDayCenter({ description, image_url }) {
    await setDoc(
        dayCenterRef,
        buildFixedProgramPayload(DAY_CENTER_ID, { description, image_url }),
        { merge: true }
    );
}

export async function fetchPrograms() {
    const snapshot = await getDocs(programsCollection);
    const programMap = new Map();

    snapshot.docs.forEach((programDoc) => {
        const id = programDoc.id;

        if (isDeprecatedFixedProgramId(id)) {
            return;
        }

        programMap.set(id, {
            id,
            ...programDoc.data()
        });
    });

    FIXED_PROGRAM_IDS.forEach((programId) => {
        if (!programMap.has(programId)) {
            const placeholder = createFixedProgramPlaceholder(programId);

            if (placeholder) {
                programMap.set(programId, placeholder);
            }
        }
    });

    return sortPrograms(Array.from(programMap.values()));
}

export function filterProgramsList(programs, searchQuery) {
    const queryText = normalizeSearchQuery(searchQuery);

    return programs.filter((program) => {
        if (!queryText) {
            return true;
        }

        const displayTitle = formatProgramTitle(program);
        const searchable = [displayTitle, program.title, program.description]
            .filter(Boolean)
            .join(" ");

        return normalizeSearchQuery(searchable).includes(queryText);
    });
}

export function getProgramSortValue(program, sortField) {
    switch (sortField) {
        case "title":
            return formatProgramTitle(program) || program.title || "";
        case "description":
            return program.description || "";
        default:
            return formatProgramTitle(program) || program.title || "";
    }
}

export async function fetchProgramsForAdminList() {
    return fetchPrograms();
}

export async function countProgramsRecords() {
    const programs = await fetchPrograms();
    return programs.length;
}

export async function addProgram({ title, description, image_url }) {
    return addDoc(programsCollection, {
        title: title.trim(),
        description: description.trim(),
        image_url: image_url.trim(),
        is_system_program: false
    });
}

export async function updateProgram(programId, { title, description, image_url }) {
    const normalizedImageUrl =
        typeof image_url === "string" ? image_url.trim() : image_url || "";

    const updates = {
        title: title.trim(),
        description: description.trim(),
        image_url: normalizedImageUrl
    };

    console.info("[programService] before Firestore update", {
        programId,
        hasImageUrl: Boolean(normalizedImageUrl),
        imageUrlLength: normalizedImageUrl.length
    });

    try {
        if (isFixedProgramId(programId)) {
            await setDoc(
                fixedProgramRef(programId),
                buildFixedProgramPayload(programId, {
                    description,
                    image_url: normalizedImageUrl
                }),
                { merge: true }
            );
        } else {
            await updateDoc(doc(db, "programs", programId), updates);
        }

        console.info("[programService] after Firestore update", { programId });
    } catch (error) {
        console.error("[programService] Firestore update failed", {
            programId,
            error
        });
        throw error;
    }
}

export async function deleteProgram(programId) {
    if (isFixedProgramId(programId)) {
        throw new Error("Cannot delete fixed program");
    }

    return deleteDoc(doc(db, "programs", programId));
}
