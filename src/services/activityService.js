import { db } from "../config/firebase";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export async function fetchActivityTypes() {
  const docs = await getDocs(collection(db, "activityTypes"));
  return docs.docs.map(d => ({
    id: d.id,
    data: d.data()
  }));
}

export async function fetchActivities() {
  const docs = await getDocs(collection(db, "activities"));
  return docs.docs.map(d => ({
    id: d.id,
    data: d.data()
  }));
}

export async function addActivity(activityData) {
  return addDoc(collection(db, "activities"), activityData);
}

export async function updateActivity(activityId, activityData) {
  return updateDoc(doc(db, "activities", activityId), activityData);
}

export async function deleteActivity(activityId) {
  return deleteDoc(doc(db, "activities", activityId));
}