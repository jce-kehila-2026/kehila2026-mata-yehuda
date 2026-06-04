import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export async function getAllActivities() {
  const snapshot = await getDocs(collection(db, "activities"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}