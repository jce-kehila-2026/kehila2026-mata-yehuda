import {
  getActivityDate,
  getParticipantIdFromRegistration,
  getStatusLabel,
  normalizeDate,
} from "./attendanceHelpers";
import {
  getAttendanceByDateForRegistrationIds,
} from "./attendanceQueries";

export function countAttendanceStatuses(attendanceByRegistrationId) {
  let presentCount = 0;
  let absentCount = 0;

  Object.values(attendanceByRegistrationId).forEach((attendanceEntry) => {
    if (attendanceEntry.status === "present") {
      presentCount += 1;
    } else if (attendanceEntry.status === "absent") {
      absentCount += 1;
    }
  });

  return { presentCount, absentCount };
}

export function calculateAttendancePercentage(presentCount, totalRegistered) {
  if (!totalRegistered) {
    return 0;
  }

  return Math.round((presentCount / totalRegistered) * 100);
}

export function formatAttendancePercentage(value) {
  return `${value ?? 0}%`;
}

export function getAttendanceSummary({
  totalRegistered = 0,
  presentCount = 0,
  absentCount = 0,
} = {}) {
  return {
    totalRegistered,
    presentCount,
    absentCount,
    attendancePercentage: calculateAttendancePercentage(
      presentCount,
      totalRegistered
    ),
  };
}

export function getGlobalAttendanceSummary(activityStats, filteredActivities) {
  const totalActivities = filteredActivities.length;
  const totalRegistered = activityStats.reduce(
    (total, activityStat) => total + activityStat.registeredCount,
    0
  );
  const totalPresent = activityStats.reduce(
    (total, activityStat) => total + activityStat.presentCount,
    0
  );
  const totalAbsent = activityStats.reduce(
    (total, activityStat) => total + activityStat.absentCount,
    0
  );

  const eligibleActivities = activityStats.filter(
    (activityStat) => activityStat.registeredCount > 0
  );
  const averageAttendancePercentage = eligibleActivities.length
    ? Math.round(
        eligibleActivities.reduce(
          (total, activityStat) => total + activityStat.attendancePercentage,
          0
        ) / eligibleActivities.length
      )
    : 0;

  return {
    totalActivities,
    totalRegistered,
    totalPresent,
    totalAbsent,
    averageAttendancePercentage,
  };
}

export function getActivityAttendanceStats(
  activities,
  registrationsByActivityId,
  attendanceRecordsByActivityId
) {
  return activities.map((activity) => {
    const registrations = registrationsByActivityId[activity.id] || [];
    const attendanceRecords = attendanceRecordsByActivityId[activity.id] || [];
    const presentCount = attendanceRecords.filter(
      (record) => record.status === "present"
    ).length;
    const absentCount = attendanceRecords.filter(
      (record) => record.status === "absent"
    ).length;
    const registeredCount = registrations.length;

    return {
      activityId: activity.id,
      activityName: activity.name || "פעילות ללא שם",
      activityDate: getActivityDate(activity),
      registeredCount,
      presentCount,
      absentCount,
      attendancePercentage: calculateAttendancePercentage(
        presentCount,
        registeredCount
      ),
    };
  });
}

export function hasMeaningfulAttendanceData(activityStats) {
  return activityStats.some(
    (activityStat) =>
      activityStat.presentCount > 0 || activityStat.absentCount > 0
  );
}

export function buildParticipantAttendanceRecords(
  registrations,
  attendanceRecords,
  fallbackDate = ""
) {
  const attendanceByRegistrationId = attendanceRecords.reduce(
    (lookup, record) => {
      lookup[record.registrationId] = record;
      return lookup;
    },
    {}
  );

  return registrations.map((registration) => {
    const attendanceRecord =
      attendanceByRegistrationId[registration.registrationId];
    const participantId =
      registration.participantId ||
      registration.participant_id ||
      getParticipantIdFromRegistration(registration);

    return {
      id: attendanceRecord?.id || registration.registrationId,
      registrationId: registration.registrationId,
      participantId,
      participantName:
        registration.participantName || participantId || "—",
      phone: registration.phone || "—",
      status: attendanceRecord?.status || "",
      statusLabel: getStatusLabel(attendanceRecord?.status || ""),
      notes: attendanceRecord?.notes || "",
      attendanceDate:
        attendanceRecord?.attendanceDate ||
        normalizeDate(fallbackDate) ||
        "",
    };
  });
}

export async function buildActivityStatFromRegistrations(
  activity,
  registrations,
  caches = null
) {
  const activityDate = getActivityDate(activity);
  const registrationIds = registrations.map(
    (registration) => registration.registrationId
  );
  const attendanceByRegistrationId = await getAttendanceByDateForRegistrationIds(
    activityDate,
    registrationIds,
    caches
  );
  const { presentCount, absentCount } = countAttendanceStatuses(
    attendanceByRegistrationId
  );

  return {
    activityId: activity.id,
    activityName: activity.name || "פעילות ללא שם",
    activityDate,
    registeredCount: registrations.length,
    presentCount,
    absentCount,
    attendancePercentage: calculateAttendancePercentage(
      presentCount,
      registrations.length
    ),
  };
}
