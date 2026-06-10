import {
  ACTIVITY_DATE_MISMATCH_WARNING,
  attendanceMapToRecords,
  filterActivities,
  normalizeDate,
  getActivityDate,
} from "./attendanceHelpers";
import {
  createAttendanceCaches,
  getAttendanceForActivityDetails,
  getConfirmedRegistrationsByActivity,
} from "./attendanceQueries";
import {
  buildActivityStatFromRegistrations,
  buildParticipantAttendanceRecords,
  calculateAttendancePercentage,
  countAttendanceStatuses,
  getAttendanceSummary,
  hasMeaningfulAttendanceData,
} from "./attendanceStatistics";

export const TOP_REGISTERED_LIMIT_OPTIONS = [3, 5, 10];

export function getTopRegisteredActivities(activityStats, limit = 3) {
  if (!activityStats?.length) {
    return [];
  }

  const safeLimit = TOP_REGISTERED_LIMIT_OPTIONS.includes(limit)
    ? limit
    : TOP_REGISTERED_LIMIT_OPTIONS[0];

  return [...activityStats]
    .sort((firstActivity, secondActivity) => {
      if (
        secondActivity.registeredCount !== firstActivity.registeredCount
      ) {
        return secondActivity.registeredCount - firstActivity.registeredCount;
      }

      return String(firstActivity.activityName || "").localeCompare(
        String(secondActivity.activityName || ""),
        "he"
      );
    })
    .slice(0, safeLimit);
}

export function getMostRegisteredActivity(activityStats) {
  const eligibleActivities = activityStats.filter(
    (activityStat) => activityStat.registeredCount > 0
  );

  if (!eligibleActivities.length) {
    return null;
  }

  return eligibleActivities.reduce((bestActivity, currentActivity) =>
    currentActivity.registeredCount > bestActivity.registeredCount
      ? currentActivity
      : bestActivity
  );
}

export function getTopAttendanceActivity(activityStats) {
  if (!hasMeaningfulAttendanceData(activityStats)) {
    return null;
  }

  const eligibleActivities = activityStats.filter(
    (activityStat) =>
      activityStat.registeredCount > 0 && activityStat.attendancePercentage > 0
  );

  if (!eligibleActivities.length) {
    return null;
  }

  return eligibleActivities.reduce((bestActivity, currentActivity) =>
    currentActivity.attendancePercentage > bestActivity.attendancePercentage
      ? currentActivity
      : bestActivity
  );
}

export function buildDashboardInsights(activityStats) {
  const mostRegistered = getMostRegisteredActivity(activityStats);
  const topAttendance = getTopAttendanceActivity(activityStats);

  return {
    mostRegistered,
    topAttendance,
    hasRegistrationData: Boolean(mostRegistered),
    hasAttendanceData: hasMeaningfulAttendanceData(activityStats),
  };
}

export async function loadActivityDetailsMode({
  activityId = "",
  selectedDate = "",
  activities = [],
} = {}) {
  if (activityId) {
    return loadActivityAttendanceDetails({
      activityId,
      selectedDate,
      activities,
    });
  }

  if (selectedDate) {
    return loadDailyAttendanceSummary({
      selectedDate,
      activities,
    });
  }

  return {
    viewMode: "activity",
    activity: null,
    summary: getAttendanceSummary(),
    participantRecords: [],
  };
}

export async function loadDailyAttendanceSummary({
  selectedDate = "",
  activities = [],
} = {}) {
  const filteredActivities = filterActivities(activities, "", selectedDate);
  const caches = createAttendanceCaches();
  const normalizedDate = normalizeDate(selectedDate);

  if (filteredActivities.length === 0) {
    return {
      viewMode: "daily",
      date: normalizedDate,
      dailySummary: {
        totalActivities: 0,
        totalRegistered: 0,
        presentCount: 0,
        absentCount: 0,
        attendancePercentage: 0,
      },
      activitySummaries: [],
    };
  }

  const activitySummaries = await Promise.all(
    filteredActivities.map(async (activity) => {
      const registrations = await getConfirmedRegistrationsByActivity(
        activity.id,
        caches
      );

      return buildActivityStatFromRegistrations(
        activity,
        registrations,
        caches
      );
    })
  );

  const totalRegistered = activitySummaries.reduce(
    (total, activityStat) => total + activityStat.registeredCount,
    0
  );
  const presentCount = activitySummaries.reduce(
    (total, activityStat) => total + activityStat.presentCount,
    0
  );
  const absentCount = activitySummaries.reduce(
    (total, activityStat) => total + activityStat.absentCount,
    0
  );

  return {
    viewMode: "daily",
    date: normalizedDate,
    dailySummary: {
      totalActivities: filteredActivities.length,
      totalRegistered,
      presentCount,
      absentCount,
      attendancePercentage: calculateAttendancePercentage(
        presentCount,
        totalRegistered
      ),
    },
    activitySummaries,
  };
}

export async function loadActivityAttendanceDetails({
  activityId = "",
  selectedDate = "",
  activities = [],
} = {}) {
  const selectedActivity = activities.find(
    (activity) => activity.id === activityId
  );

  if (!selectedActivity) {
    return {
      viewMode: "activity",
      activity: null,
      summary: getAttendanceSummary(),
      participantRecords: [],
    };
  }

  const activityDate = getActivityDate(selectedActivity);
  const normalizedActivityDate = normalizeDate(activityDate);
  const normalizedSelectedDate = normalizeDate(selectedDate);
  const dateMismatchWarning = Boolean(
    normalizedSelectedDate &&
      normalizedActivityDate &&
      normalizedSelectedDate !== normalizedActivityDate
  );
  const attendanceDate = normalizedActivityDate || normalizedSelectedDate;

  const caches = createAttendanceCaches();
  const registrations = await getConfirmedRegistrationsByActivity(
    activityId,
    caches
  );
  const registrationIds = registrations.map(
    (registration) => registration.registrationId
  );
  const attendanceByRegistrationId = await getAttendanceForActivityDetails(
    activityId,
    attendanceDate,
    registrationIds,
    caches
  );
  const attendanceRecords = attendanceMapToRecords(
    attendanceByRegistrationId,
    attendanceDate
  );
  const participantRecords = buildParticipantAttendanceRecords(
    registrations,
    attendanceRecords,
    attendanceDate
  );
  const { presentCount, absentCount } = countAttendanceStatuses(
    attendanceByRegistrationId
  );

  return {
    viewMode: "activity",
    activity: {
      id: selectedActivity.id,
      name: selectedActivity.name || "פעילות ללא שם",
      date: activityDate,
    },
    summary: getAttendanceSummary({
      totalRegistered: registrations.length,
      presentCount,
      absentCount,
    }),
    participantRecords,
    dateMismatchWarning,
    warningMessage: dateMismatchWarning
      ? ACTIVITY_DATE_MISMATCH_WARNING
      : "",
  };
}

export async function loadGlobalAttendanceDashboard({
  activities = [],
} = {}) {
  const filteredActivities = filterActivities(activities, "", "");
  const caches = createAttendanceCaches();

  if (filteredActivities.length === 0) {
    return {
      activityStats: [],
    };
  }

  const activityStats = await Promise.all(
    filteredActivities.map(async (activity) => {
      const registrations = await getConfirmedRegistrationsByActivity(
        activity.id,
        caches
      );

      return buildActivityStatFromRegistrations(
        activity,
        registrations,
        caches
      );
    })
  );

  return {
    activityStats,
  };
}

export async function loadAttendanceRecordsPageData({
  activityId = "",
  selectedDate = "",
  activities = [],
} = {}) {
  if (activityId || selectedDate) {
    return loadActivityDetailsMode({
      activityId,
      selectedDate,
      activities,
    });
  }

  return loadGlobalAttendanceDashboard({
    activities,
  });
}

export async function loadAttendanceDashboardData({
  activityId = "",
  selectedDate = "",
  activities = [],
} = {}) {
  return loadAttendanceRecordsPageData({
    activityId,
    selectedDate,
    activities,
  });
}
