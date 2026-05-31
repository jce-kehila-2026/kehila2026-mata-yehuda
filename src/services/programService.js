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

export const DAY_CENTER_ID = "day_center";

const programsCollection = collection(db, "programs");
const dayCenterRef = doc(db, "programs", DAY_CENTER_ID);

export function isDayCenterEntry(program) {
    return (
        program?.id === DAY_CENTER_ID ||
        program?.is_day_center === true
    );
}

function sortPrograms(programs) {
    return [...programs].sort((a, b) => {
        const aIsDayCenter = isDayCenterEntry(a);
        const bIsDayCenter = isDayCenterEntry(b);

        if (aIsDayCenter && !bIsDayCenter) return -1;
        if (!aIsDayCenter && bIsDayCenter) return 1;

        return (a.title || "").localeCompare(b.title || "", "he");
    });
}

export async function fetchDayCenter() {
    const snap = await getDoc(dayCenterRef);

    if (!snap.exists()) {
        return {
            title: "מרכז יום",
            description: "",
            image_url: ""
        };
    }

    const data = snap.data();
    return {
        title: data.title || "מרכז יום",
        description: data.description || "",
        image_url: data.image_url || ""
    };
}

export async function saveDayCenter({ description, image_url }) {
    await setDoc(
        dayCenterRef,
        {
            title: "מרכז יום",
            description: description.trim(),
            image_url: image_url.trim(),
            is_day_center: true
        },
        { merge: true }
    );
}

export async function fetchPrograms() {
    const snapshot = await getDocs(programsCollection);
    const programs = snapshot.docs.map((programDoc) => ({
        id: programDoc.id,
        ...programDoc.data()
    }));

    const hasDayCenter = programs.some((program) => isDayCenterEntry(program));

    if (!hasDayCenter) {
        programs.unshift({
            id: DAY_CENTER_ID,
            title: "מרכז יום",
            description: "",
            image_url: "",
            is_day_center: true
        });
    }

    return sortPrograms(programs);
}

export async function addProgram({ title, description, image_url }) {
    return addDoc(programsCollection, {
        title: title.trim(),
        description: description.trim(),
        image_url: image_url.trim(),
        is_day_center: false
    });
}

export async function updateProgram(programId, { title, description, image_url }) {
    const updates = {
        title: title.trim(),
        description: description.trim(),
        image_url: image_url.trim()
    };

    if (programId === DAY_CENTER_ID) {
        return setDoc(
            dayCenterRef,
            { ...updates, is_day_center: true },
            { merge: true }
        );
    }

    return updateDoc(doc(db, "programs", programId), updates);
}

export async function deleteProgram(programId) {
    if (programId === DAY_CENTER_ID) {
        throw new Error("Cannot delete day center");
    }

    return deleteDoc(doc(db, "programs", programId));
}
