import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { DAY_CENTER_ID } from "../../utils/staffManegmentUtils/programConstants";

const dayCenterRef = doc(db, "programs", DAY_CENTER_ID);

export async function fetchDayCenterScheduleImageUrl() {
    const snap = await getDoc(dayCenterRef);

    if (!snap.exists()) {
        return "";
    }

    return snap.data()?.schedule_image_url || "";
}

/** Updates only schedule_image_url on programs/day_center. */
export async function updateDayCenterScheduleImageUrl(schedule_image_url) {
    const normalizedUrl =
        typeof schedule_image_url === "string" ? schedule_image_url.trim() : "";

    await updateDoc(dayCenterRef, {
        schedule_image_url: normalizedUrl
    });
}
