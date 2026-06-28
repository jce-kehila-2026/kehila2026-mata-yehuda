import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function getAllActivities() {
  const snapshot = await getDocs(collection(db, "activities"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getActivityById(activityId) {
  if (!activityId) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "activities", activityId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}