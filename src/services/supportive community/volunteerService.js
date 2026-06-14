import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase.js";

export const checkIfVolunteerExists = async (id) => {
  const volunteerRef = doc(db, "volunteers", id);
  const volunteerSnapshot = await getDoc(volunteerRef);

  return volunteerSnapshot.exists();
};

export const saveVolunteerData = async (id, data, { merge = false } = {}) => {
  await setDoc(
    doc(db, "volunteers", id),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    merge ? { merge: true } : undefined
  );
};
