import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const getActivitiesBySearch = async (activityName, selectedDate) => {
  const activitiesRef = collection(db, "activities");
  const conditions = [];

  if (activityName !== "") {
    conditions.push(where("name", "==", activityName));
  }

  if (selectedDate !== "") {
    conditions.push(where("start_date", "==", selectedDate));
  }

  const q =
    conditions.length > 0 ? query(activitiesRef, ...conditions) : activitiesRef;

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getConfirmedRegistrationsByActivity = async (activityId) => {
  const registrationsRef = collection(db, "registrations");

  const q = query(
    registrationsRef,
    where("activityId", "==", activityId),
    where("registrationStatus", "==", "confirmed")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    registrationId: doc.id,
    ...doc.data(),
    status: "",
  }));
};

export const saveAttendanceRecords = async (
  attendanceRows,
  selectedDate,
  staffId
) => {
  for (const row of attendanceRows) {
    await addDoc(collection(db, "attendance"), {
      registrationId: row.registrationId,
      participantId: row.participantId,
      activityId: row.activityId,
      attendanceDate: selectedDate,
      status: row.status,
      recordedByStaffId: staffId,
      createdAt: serverTimestamp(),
    });
  }
};