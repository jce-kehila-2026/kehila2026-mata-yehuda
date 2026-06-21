import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../config/firebase";

const REQUESTS_COLLECTION = "requests";

export async function getAllRequests() {
  const snapshot = await getDocs(collection(db, REQUESTS_COLLECTION));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function fetchWaitingRequests() {
  const requests = await getAllRequests();

  return requests.filter((request) => request.status === "waiting");
}

export async function markRequestAsAnswered(
  requestId,
  answer,
  { channel = "whatsapp" } = {},
) {
  await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), {
    status: "answered",
    answer,
    answerChannel: channel,
    answeredAt: new Date(),
  });
}

export async function markRequestAsAnsweredByPhone(requestId, note = "") {
  const trimmedNote = String(note ?? "").trim();
  const answer = trimmedNote || "נענה בשיחת טלפון";

  await markRequestAsAnswered(requestId, answer, { channel: "phone" });
}
