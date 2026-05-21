import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";

export const saveVolunteerData = async (id, data) => {
  await setDoc(
    doc(db, "volunteers", id),
    data
  );
};