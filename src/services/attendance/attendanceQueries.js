import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import { isRecordActive } from "../../utils/staffManegmentUtils/archiveUtils";
import {
  ACCEPTED_REGISTRATION_STATUSES,
  buildAttendanceByRegistrationIdFromDateRecords,
  getActivityDate,
  getAttendanceDateFromRecord,
  getParticipantDisplayName,
  getParticipantDisplayPhone,
  getParticipantIdFromRegistration,
  getRegistrationIdFromAttendance,
  getRegistrationStatus,
  getStatusLabel,
  normalizeDate,
} from "./attendanceHelpers";

async function fetchParticipantById(participantId) {
  if (!participantId) return null;

  const collectionsToTry = ["participants", "users"];

  for (const collectionName of collectionsToTry) {
    try {
      const participantDoc = await getDoc(doc(db, collectionName, participantId));

      if (participantDoc.exists()) {
        console.log(
          `[Attendance] participant found in ${collectionName}:`,
          participantId
        );
        return participantDoc.data();
      }
    } catch (error) {
      console.warn(
        `[Attendance] Could not fetch participant from ${collectionName}:`,
        participantId,
        error
      );
    }
  }

  console.log(
    `[Attendance] participant document not found for id:`,
    participantId
  );

  return null;
}

export function createAttendanceCaches() {
  const participantCache = new Map();
  const attendanceDocumentsByDate = new Map();
  const attendanceDocumentsByActivity = new Map();

  return {
    attendanceDocumentsByDate,
    attendanceDocumentsByActivity,
    async getParticipant(participantId) {
      if (!participantId) {
        return null;
      }

      if (participantCache.has(participantId)) {
        return participantCache.get(participantId);
      }

      const participant = await fetchParticipantById(participantId);
      participantCache.set(participantId, participant);
      return participant;
    },
  };
}

async function fetchAttendanceDocumentsForDate(selectedDate, caches = null) {
  const normalizedDate = normalizeDate(selectedDate);

  if (!normalizedDate) {
    return [];
  }

  if (caches?.attendanceDocumentsByDate.has(normalizedDate)) {
    return caches.attendanceDocumentsByDate.get(normalizedDate);
  }

  const attendanceRef = collection(db, "attendance");
  const snakeCaseSnapshot = await getDocs(
    query(attendanceRef, where("attendance_date", "==", normalizedDate))
  );

  let records = snakeCaseSnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  if (records.length === 0) {
    const camelCaseSnapshot = await getDocs(
      query(attendanceRef, where("attendanceDate", "==", normalizedDate))
    );

    records = camelCaseSnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  }

  caches?.attendanceDocumentsByDate.set(normalizedDate, records);
  return records;
}

export async function getAttendanceByDateForRegistrationIds(
  attendanceDate,
  registrationIds,
  caches = null
) {
  if (!attendanceDate || registrationIds.length === 0) {
    return {};
  }

  const dateRecords = await fetchAttendanceDocumentsForDate(
    attendanceDate,
    caches
  );

  return buildAttendanceByRegistrationIdFromDateRecords(
    dateRecords,
    registrationIds
  );
}

async function fetchAttendanceDocumentsByActivityId(
  activityId,
  attendanceDate,
  caches = null
) {
  if (!activityId || !attendanceDate) {
    return [];
  }

  const normalizedDate = normalizeDate(attendanceDate);
  const cacheKey = `${activityId}:${normalizedDate}`;

  if (caches?.attendanceDocumentsByActivity.has(cacheKey)) {
    return caches.attendanceDocumentsByActivity.get(cacheKey);
  }

  const attendanceRef = collection(db, "attendance");
  const snakeCaseSnapshot = await getDocs(
    query(
      attendanceRef,
      where("activity_id", "==", activityId),
      where("attendance_date", "==", normalizedDate)
    )
  );

  let records = snakeCaseSnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  if (records.length === 0) {
    const camelActivityIdSnapshot = await getDocs(
      query(
        attendanceRef,
        where("activityId", "==", activityId),
        where("attendance_date", "==", normalizedDate)
      )
    );

    records = camelActivityIdSnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  }

  if (records.length === 0) {
    const camelDateSnapshot = await getDocs(
      query(
        attendanceRef,
        where("activity_id", "==", activityId),
        where("attendanceDate", "==", normalizedDate)
      )
    );

    records = camelDateSnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  }

  if (records.length === 0) {
    const camelBothSnapshot = await getDocs(
      query(
        attendanceRef,
        where("activityId", "==", activityId),
        where("attendanceDate", "==", normalizedDate)
      )
    );

    records = camelBothSnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  }

  caches?.attendanceDocumentsByActivity.set(cacheKey, records);
  return records;
}

export async function getAttendanceForActivityDetails(
  activityId,
  attendanceDate,
  registrationIds,
  caches = null
) {
  if (activityId) {
    const activityAttendanceRecords = await fetchAttendanceDocumentsByActivityId(
      activityId,
      attendanceDate,
      caches
    );

    if (activityAttendanceRecords.length > 0) {
      return buildAttendanceByRegistrationIdFromDateRecords(
        activityAttendanceRecords,
        registrationIds
      );
    }
  }

  return getAttendanceByDateForRegistrationIds(
    attendanceDate,
    registrationIds,
    caches
  );
}

export const getAllActivities = async () => {
  const activitiesRef = collection(db, "activities");
  const snapshot = await getDocs(activitiesRef);

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data(),
    }))
    .filter(isRecordActive)
    .sort((firstActivity, secondActivity) => {
      const firstDate = getActivityDate(firstActivity);
      const secondDate = getActivityDate(secondActivity);

      if (firstDate !== secondDate) {
        return secondDate.localeCompare(firstDate);
      }

      return String(firstActivity.name || "").localeCompare(
        String(secondActivity.name || ""),
        "he"
      );
    });
};

async function loadParticipantsForActivity(activity, fallbackDate) {
  const registrations = await getConfirmedRegistrationsByActivity(activity.id);
  const activityDate = getActivityDate(activity) || fallbackDate || "";
  const registrationIds = registrations.map(
    (registration) => registration.registrationId
  );
  const existingAttendance = await getExistingAttendanceForRegistrations(
    activityDate,
    registrationIds
  );

  return registrations.map((registration) => ({
    ...registration,
    status: existingAttendance[registration.registrationId]?.status || "",
    notes: existingAttendance[registration.registrationId]?.notes || "",
    activityName: activity.name || "פעילות",
    activityId: activity.id,
    activityDate,
    participantId:
      registration.participantId ||
      registration.participant_id ||
      getParticipantIdFromRegistration(registration),
  }));
}

export const loadParticipantsForActivities = async (activities, fallbackDate) => {
  if (!activities.length) {
    return [];
  }

  const participantGroups = await Promise.all(
    activities.map((activity) => loadParticipantsForActivity(activity, fallbackDate))
  );

  return participantGroups.flat();
};

export const getConfirmedRegistrationsByActivity = async (
  activityId,
  caches = null
) => {
  // Legacy data uses both activity_id and activityId on registration docs.
  // Both queries are required until the database is fully normalized.
  console.log("[Attendance] selectedActivityId:", activityId);
  console.log("[Attendance] activity document id:", activityId);

  const registrationsRef = collection(db, "registrations");
  const registrationsBySnakeCase = query(
    registrationsRef,
    where("activity_id", "==", activityId)
  );
  const registrationsByCamelCase = query(
    registrationsRef,
    where("activityId", "==", activityId)
  );

  const [snakeCaseSnapshot, camelCaseSnapshot] = await Promise.all([
    getDocs(registrationsBySnakeCase),
    getDocs(registrationsByCamelCase),
  ]);

  const registrationsMap = new Map();

  snakeCaseSnapshot.docs.forEach((document) => {
    registrationsMap.set(document.id, {
      id: document.id,
      ...document.data(),
    });
  });

  camelCaseSnapshot.docs.forEach((document) => {
    registrationsMap.set(document.id, {
      id: document.id,
      ...document.data(),
    });
  });

  const registrations = Array.from(registrationsMap.values());

  console.log("[Attendance] all registrations returned:", registrations);
  console.log(
    "[Attendance] registrations filtered by activity_id:",
    registrations.filter(
      (registration) =>
        registration.activity_id === activityId ||
        registration.activityId === activityId
    )
  );

  const statusValues = [
    ...new Set(
      registrations.map((registration) => {
        const status = getRegistrationStatus(registration);
        return status || "(empty)";
      })
    ),
  ];

  console.log("[Attendance] registration_status values found:", statusValues);
  console.log(
    "[Attendance] accepted registration_status values (reference):",
    ACCEPTED_REGISTRATION_STATUSES
  );

  return Promise.all(
    registrations.map(async (registration) => {
      const participantId = getParticipantIdFromRegistration(registration);
      const participant = caches
        ? await caches.getParticipant(participantId)
        : await fetchParticipantById(participantId);

      return {
        ...registration,
        registrationId: registration.id,
        participantId,
        participantName: getParticipantDisplayName(
          participant,
          registration,
          participantId
        ),
        phone: getParticipantDisplayPhone(participant, registration),
        status: "",
      };
    })
  );
};

export const getExistingAttendanceForRegistrations = async (
  attendanceDate,
  registrationIds
) => {
  if (!attendanceDate || registrationIds.length === 0) {
    return {};
  }

  const attendanceByRegistrationId = await getAttendanceByDateForRegistrationIds(
    attendanceDate,
    registrationIds
  );
  const existingAttendanceByRegistrationId = {};

  Object.entries(attendanceByRegistrationId).forEach(
    ([registrationId, attendanceEntry]) => {
      existingAttendanceByRegistrationId[registrationId] = {
        status: attendanceEntry.status,
        notes: attendanceEntry.notes,
      };
    }
  );

  return existingAttendanceByRegistrationId;
};

async function findExistingAttendanceDocument(registrationId, attendanceDate) {
  const normalizedDate = normalizeDate(attendanceDate);
  const attendanceRef = collection(db, "attendance");

  const snakeCaseSnapshot = await getDocs(
    query(
      attendanceRef,
      where("registration_id", "==", registrationId),
      where("attendance_date", "==", normalizedDate)
    )
  );

  if (!snakeCaseSnapshot.empty) {
    return snakeCaseSnapshot.docs[0];
  }

  const camelCaseSnapshot = await getDocs(
    query(
      attendanceRef,
      where("registrationId", "==", registrationId),
      where("attendanceDate", "==", normalizedDate)
    )
  );

  if (!camelCaseSnapshot.empty) {
    return camelCaseSnapshot.docs[0];
  }

  return null;
}

async function fetchRegistrationById(registrationId) {
  if (!registrationId) return null;

  try {
    const registrationDoc = await getDoc(doc(db, "registrations", registrationId));

    if (registrationDoc.exists()) {
      return {
        id: registrationDoc.id,
        ...registrationDoc.data(),
      };
    }
  } catch (error) {
    console.warn("[Attendance] Could not fetch registration:", registrationId, error);
  }

  return null;
}

async function fetchActivityById(activityId) {
  if (!activityId) return null;

  try {
    const activityDoc = await getDoc(doc(db, "activities", activityId));

    if (activityDoc.exists()) {
      return {
        id: activityDoc.id,
        ...activityDoc.data(),
      };
    }
  } catch (error) {
    console.warn("[Attendance] Could not fetch activity:", activityId, error);
  }

  return null;
}

async function fetchAttendanceDocuments(selectedDate) {
  if (selectedDate) {
    return fetchAttendanceDocumentsForDate(selectedDate);
  }

  const attendanceRef = collection(db, "attendance");
  const snapshot = await getDocs(attendanceRef);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function getAttendanceRecords({ activityId = "", selectedDate = "" } = {}) {
  const attendanceDocuments = await fetchAttendanceDocuments(selectedDate);
  const enrichedRecords = [];

  for (const record of attendanceDocuments) {
    const registrationId = getRegistrationIdFromAttendance(record);
    const registration = await fetchRegistrationById(registrationId);

    if (!registration) {
      continue;
    }

    const registrationActivityId =
      registration.activity_id || registration.activityId || "";

    if (activityId && registrationActivityId !== activityId) {
      continue;
    }

    const activity = await fetchActivityById(registrationActivityId);
    const participantId = getParticipantIdFromRegistration(registration);
    const participant = await fetchParticipantById(participantId);
    const attendanceDate = getAttendanceDateFromRecord(record);

    enrichedRecords.push({
      id: record.id,
      registrationId,
      participantId,
      attendanceDate,
      status: record.status || "",
      statusLabel: getStatusLabel(record.status),
      notes: record.notes || "",
      activityId: registrationActivityId,
      activityName: activity?.name || "—",
      activityDate: getActivityDate(activity) || attendanceDate,
      participantName: getParticipantDisplayName(
        participant,
        registration,
        participantId
      ),
      phone: getParticipantDisplayPhone(participant, registration),
    });
  }

  enrichedRecords.sort((firstRecord, secondRecord) => {
    const dateCompare = secondRecord.attendanceDate.localeCompare(
      firstRecord.attendanceDate
    );

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return String(firstRecord.activityName || "").localeCompare(
      String(secondRecord.activityName || ""),
      "he"
    );
  });

  return enrichedRecords;
}

export const saveAttendanceRecords = async (
  attendanceRows,
  attendanceDate,
  staffId = ""
) => {
  if (attendanceRows.length === 0) {
    return;
  }

  const recordedByStaffId = staffId || "";

  for (const row of attendanceRows) {
    const registrationId = row.registrationId;
    const rowAttendanceDate = normalizeDate(
      row.activityDate || attendanceDate
    );

    if (!rowAttendanceDate) {
      throw new Error("Missing attendance date");
    }

    const existingDocument = await findExistingAttendanceDocument(
      registrationId,
      rowAttendanceDate
    );

    const payload = {
      registration_id: registrationId,
      attendance_date: rowAttendanceDate,
      status: row.status,
      recorded_by_staff_id: recordedByStaffId,
      notes: row.notes || "",
    };

    const rowActivityId = row.activityId || row.activity_id;

    if (rowActivityId) {
      payload.activity_id = rowActivityId;
      payload.activityId = rowActivityId;
    }

    if (existingDocument) {
      await updateDoc(existingDocument.ref, payload);
    } else {
      await addDoc(collection(db, "attendance"), payload);
    }
  }
};
