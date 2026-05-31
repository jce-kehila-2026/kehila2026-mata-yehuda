import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const dayCenterRef = doc(db, "dayCenter", "info");

export async function fetchDayCenter() {
    const snap = await getDoc(dayCenterRef);

    if (!snap.exists()) {
        return {
            description: "",
            image_url: ""
        };
    }

    const data = snap.data();
    return {
        description: data.description || "",
        image_url: data.image_url || ""
    };
}

export async function saveDayCenter({ description, image_url }) {
    await setDoc(
        dayCenterRef,
        {
            description: description.trim(),
            image_url: image_url.trim()
        },
        { merge: true }
    );
}
