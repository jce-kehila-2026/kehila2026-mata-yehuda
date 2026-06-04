import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

const REQUESTS_COLLECTION = "requests";

export async function getAllRequests() {
  const snapshot = await getDocs(collection(db, REQUESTS_COLLECTION));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function markRequestAsAnswered(requestId, answer) {
  await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), {
    status: "answered",
    answer,
    answeredAt: new Date(),
  });
}
