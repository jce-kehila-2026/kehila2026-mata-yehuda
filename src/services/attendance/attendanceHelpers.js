function normalizeDate(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.split("T")[0];
  }

  const dateValue =
    typeof value.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : null;

  if (dateValue) {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(value).split("T")[0];
}

export const ACCEPTED_REGISTRATION_STATUSES = [
  "confirmed",
  "מאושר",
  "הושלם",
];

export function getRegistrationStatus(registration) {
  return registration.registration_status ?? registration.registrationStatus ?? "";
}

export function getParticipantIdFromRegistration(registration) {
  return registration.participant_id || registration.participantId || "";
}

function getParticipantNameFromRegistration(registration) {
  if (registration.participantName) return registration.participantName;
  if (registration.participant_name) return registration.participant_name;

  const firstName =
    registration.participant_first_name ||
    registration.participantFirstName ||
    "";
  const lastName =
    registration.participant_last_name || registration.participantLastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "";
}

function getParticipantPhoneFromRegistration(registration) {
  return (
    registration.participant_phone ||
    registration.participantPhone ||
    registration.phone ||
    ""
  );
}

function getParticipantName(participant) {
  if (!participant) return "";

  if (participant.name) return participant.name;
  if (participant.full_name) return participant.full_name;

  const firstName = participant.first_name || participant.firstName || "";
  const lastName = participant.last_name || participant.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "";
}

function getParticipantPhone(participant) {
  if (!participant) return "";

  return (
    participant.phone ||
    participant.phone_number ||
    participant.mobile ||
    ""
  );
}

export function getParticipantDisplayName(participant, registration, participantId) {
  const registrationName = getParticipantNameFromRegistration(registration);
  if (registrationName) return registrationName;

  const participantName = getParticipantName(participant);
  if (participantName) return participantName;

  return participantId || "—";
}

export function getParticipantDisplayPhone(participant, registration) {
  const registrationPhone = getParticipantPhoneFromRegistration(registration);
  if (registrationPhone) return registrationPhone;

  const participantPhone = getParticipantPhone(participant);
  return participantPhone || "—";
}

export function getRegistrationIdFromAttendance(record) {
  return record.registration_id || record.registrationId || "";
}

export function getAttendanceDateFromRecord(record) {
  return normalizeDate(record.attendance_date || record.attendanceDate || "");
}

export function getStatusLabel(status) {
  if (status === "present") return "נוכח";
  if (status === "absent") return "נעדר";
  return status || "—";
}

export function getActivityDate(activity) {
  if (!activity) return "";

  return normalizeDate(activity.start_date ?? activity.startDate ?? "");
}

export function formatActivityDisplayDate(dateValue) {
  const normalized = normalizeDate(dateValue);

  if (!normalized) return "";

  const [year, month, day] = normalized.split("-");

  return `${day}/${month}/${year}`;
}

export function formatActivityOptionLabel(activity) {
  const name = activity.name || "פעילות ללא שם";
  const displayDate = formatActivityDisplayDate(getActivityDate(activity));

  return displayDate ? `${name} - ${displayDate}` : name;
}

export function formatActivityNameLabel(activity) {
  return activity.name || "פעילות ללא שם";
}

export const ACTIVITY_DATE_MISMATCH_WARNING =
  "שימו לב: התאריך שנבחר אינו תואם לפעילות. מוצגים נתוני הפעילות בתאריך המקורי שלה.";

export function getActivityTime(activity) {
  if (!activity) return "";

  return (
    activity.start_time ||
    activity.startTime ||
    activity.time ||
    activity.activity_time ||
    ""
  );
}

export function getActivityLocation(activity) {
  if (!activity) return "";

  return (
    activity.location ||
    activity.place ||
    activity.address ||
    activity.venue ||
    ""
  );
}

export function getActivitiesByDate(activities, selectedDate) {
  const normalizedSearchDate = normalizeDate(selectedDate);

  return activities.filter(
    (activity) => getActivityDate(activity) === normalizedSearchDate
  );
}

export function filterActivities(activities, activityId, selectedDate) {
  let filteredActivities = activities;

  if (activityId) {
    filteredActivities = filteredActivities.filter(
      (activity) => activity.id === activityId
    );
  }

  if (selectedDate) {
    filteredActivities = getActivitiesByDate(filteredActivities, selectedDate);
  }

  return filteredActivities;
}

export function groupAttendanceRecordsByActivityId(attendanceRecords) {
  return attendanceRecords.reduce((recordsByActivityId, record) => {
    if (!recordsByActivityId[record.activityId]) {
      recordsByActivityId[record.activityId] = [];
    }

    recordsByActivityId[record.activityId].push(record);
    return recordsByActivityId;
  }, {});
}

export function buildAttendanceByRegistrationIdFromDateRecords(
  dateRecords,
  registrationIds
) {
  const registrationIdSet = new Set(registrationIds);
  const attendanceByRegistrationId = {};

  dateRecords.forEach((record) => {
    const registrationId = getRegistrationIdFromAttendance(record);

    if (registrationIdSet.has(registrationId)) {
      attendanceByRegistrationId[registrationId] = {
        id: record.id,
        status: record.status || "",
        notes: record.notes || "",
      };
    }
  });

  return attendanceByRegistrationId;
}

export function attendanceMapToRecords(attendanceByRegistrationId, attendanceDate) {
  const normalizedDate = normalizeDate(attendanceDate);

  return Object.entries(attendanceByRegistrationId).map(
    ([registrationId, attendanceEntry]) => ({
      id: attendanceEntry.id || registrationId,
      registrationId,
      attendanceDate: normalizedDate,
      status: attendanceEntry.status || "",
      notes: attendanceEntry.notes || "",
      statusLabel: getStatusLabel(attendanceEntry.status),
    })
  );
}

export { normalizeDate };
