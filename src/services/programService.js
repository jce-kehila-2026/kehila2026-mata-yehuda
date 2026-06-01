import { db } from "../config/firebase";
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
import {
    DAY_CENTER_ID,
    DAY_CENTER_NAME,
    FIXED_PROGRAMS,
    FIXED_PROGRAM_IDS,
    createFixedProgramPlaceholder,
    getFixedProgramById,
    isDeprecatedFixedProgramId,
    isFixedProgramId
} from "../utils/programConstants";

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
} from "../utils/programConstants";

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

export async function addProgram({ title, description, image_url }) {
    return addDoc(programsCollection, {
        title: title.trim(),
        description: description.trim(),
        image_url: image_url.trim(),
        is_system_program: false
    });
}

export async function updateProgram(programId, { title, description, image_url }) {
    const updates = {
        title: title.trim(),
        description: description.trim(),
        image_url: image_url.trim()
    };

    if (isFixedProgramId(programId)) {
        return setDoc(
            fixedProgramRef(programId),
            buildFixedProgramPayload(programId, { description, image_url }),
            { merge: true }
        );
    }

    return updateDoc(doc(db, "programs", programId), updates);
}

export async function deleteProgram(programId) {
    if (isFixedProgramId(programId)) {
        throw new Error("Cannot delete fixed program");
    }

    return deleteDoc(doc(db, "programs", programId));
}
