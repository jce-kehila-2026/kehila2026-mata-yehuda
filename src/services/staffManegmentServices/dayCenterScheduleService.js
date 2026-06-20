import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { DAY_CENTER_ID } from "../../utils/staffManegmentUtils/programConstants";

const dayCenterRef = doc(db, "programs", DAY_CENTER_ID);

function normalizeLoozUrl(value) {
    return typeof value === "string" ? value.trim() : "";
}

export async function fetchDayCenterLoozUrl() {
    const snap = await getDoc(dayCenterRef);

    if (!snap.exists()) {
        return "";
    }

    return snap.data()?.["looz-url"] || "";
}

/** Updates only programs/day_center["looz-url"]. */
export async function updateDayCenterLoozUrl(imageData) {
    await updateDoc(dayCenterRef, {
        "looz-url": normalizeLoozUrl(imageData)
    });
}
