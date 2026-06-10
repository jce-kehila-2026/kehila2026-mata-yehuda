import { useCallback, useEffect, useRef, useState } from "react";
import AttendanceSearch from "../../components/attendance/AttendanceSearch";
import AttendanceSummaryCards from "../../components/attendance/AttendanceSummaryCards";
import TopRegisteredActivities from "../../components/attendance/TopRegisteredActivities";
import AttendanceRecordsTable from "../../components/attendance/AttendanceRecordsTable";
import ActivityAttendanceTable from "../../components/attendance/ActivityAttendanceTable";
import DailyAttendanceView from "../../components/attendance/DailyAttendanceView";
import DateMismatchNotice from "../../components/attendance/DateMismatchNotice";
import ActivityInfoCard from "../../components/attendance/ActivityInfoCard";
import "../../styles/attendance/AttendanceRecordsPage.css";
import "../../styles/attendance/AttendanceButtons.css";

import {
  formatActivityNameLabel,
  getActivities,
  loadActivityDetailsMode,
  loadGlobalAttendanceDashboard,
} from "../../services/attendanceService";

const LOADING_MESSAGES = {
  dashboard: "טוען נתונים...",
  activity: "טוען רשומות נוכחות...",
};

const INITIAL_HINT = "בחרו פעילות או תאריך כדי להתחיל.";
const EMPTY_RESULTS_MESSAGE = "לא נמצאו רשומות נוכחות.";

function AttendanceRecordsPage({ onBack }) {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [appliedActivityId, setAppliedActivityId] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [activityData, setActivityData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [hasRequestedData, setHasRequestedData] = useState(false);
  const [error, setError] = useState("");
  const initialLoadDoneRef = useRef(false);

  const hasSelectedActivityOrDate = Boolean(
    appliedActivityId || appliedDate
  );
  const isActivityLoading = loadingRecords && hasSelectedActivityOrDate;
  const isDashboardLoading =
    loadingActivities || (loadingRecords && !hasSelectedActivityOrDate);
  const isPageLoading = isDashboardLoading || isActivityLoading;

  const loadPageData = useCallback(async (activityId, date, activitiesList) => {
    const isDetailsMode = Boolean(activityId || date);

    setHasRequestedData(true);
    setAppliedActivityId(activityId);
    setAppliedDate(date);
    setLoadingRecords(true);
    setError("");

    try {
      if (isDetailsMode) {
        setDashboardData(null);

        const data = await loadActivityDetailsMode({
          activityId,
          selectedDate: date,
          activities: activitiesList,
        });

        setActivityData(data);
      } else {
        setActivityData(null);

        const data = await loadGlobalAttendanceDashboard({
          activities: activitiesList,
        });

        setDashboardData(data);
      }
    } catch (loadError) {
      console.error("Error loading attendance records page:", loadError);
      setActivityData(null);
      setDashboardData(null);
      setError("אירעה שגיאה בטעינת רשומות הנוכחות");
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchActivities() {
      setLoadingActivities(true);

      try {
        const allActivities = await getActivities();

        if (isMounted) {
          setActivities(allActivities);
        }
      } catch (loadError) {
        console.error("Error loading activities:", loadError);

        if (isMounted) {
          setError("אירעה שגיאה בטעינת הפעילויות");
        }
      } finally {
        if (isMounted) {
          setLoadingActivities(false);
        }
      }
    }

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loadingActivities || initialLoadDoneRef.current) {
      return;
    }

    initialLoadDoneRef.current = true;
    loadPageData("", "", activities);
  }, [loadingActivities, activities, loadPageData]);

  const handleSearch = () => {
    loadPageData(selectedActivityId, selectedDate, activities);
  };

  const handleActivityRowSelect = (activityId) => {
    setSelectedDate("");
    setSelectedActivityId(activityId);
    loadPageData(activityId, "", activities);
  };

  const renderEmptyResults = () => (
    <div className="attendance-records-page__section">
      <div className="attendance-records-page__card">
        <p className="attendance-records-page__empty">{EMPTY_RESULTS_MESSAGE}</p>
      </div>
    </div>
  );

  const renderGeneralDashboard = () => {
    if (!dashboardData || dashboardData.activityStats.length === 0) {
      return renderEmptyResults();
    }

    return (
      <>
        <TopRegisteredActivities
          activityStats={dashboardData.activityStats}
          onActivitySelect={handleActivityRowSelect}
        />
        <ActivityAttendanceTable
          activityStats={dashboardData.activityStats}
          onActivitySelect={handleActivityRowSelect}
        />
      </>
    );
  };

  const renderActivityDetails = () => {
    if (!activityData) {
      return renderEmptyResults();
    }

    if (activityData.viewMode === "daily") {
      if (
        activityData.dailySummary.totalActivities === 0 &&
        activityData.activitySummaries.length === 0
      ) {
        return (
          <div className="attendance-records-page__section">
            <div className="attendance-records-page__card">
              <p className="attendance-records-page__empty">
                לא נמצאו פעילויות בתאריך שנבחר.
              </p>
            </div>
          </div>
        );
      }

      return <DailyAttendanceView dailyData={activityData} />;
    }

    if (!activityData.activity) {
      return renderEmptyResults();
    }

    return (
      <>
        {activityData.dateMismatchWarning && (
          <DateMismatchNotice
            message={activityData.warningMessage}
            activityDate={activityData.activity.date}
          />
        )}
        <ActivityInfoCard activity={activityData.activity} />
        <AttendanceSummaryCards summary={activityData.summary} />
        <AttendanceRecordsTable records={activityData.participantRecords} />
      </>
    );
  };

  const renderPageContent = () => {
    if (hasSelectedActivityOrDate) {
      return renderActivityDetails();
    }

    return renderGeneralDashboard();
  };

  const showInitialHint =
    !error &&
    !isPageLoading &&
    !hasSelectedActivityOrDate &&
    !hasRequestedData;

  const loadingMessage = isActivityLoading
    ? LOADING_MESSAGES.activity
    : LOADING_MESSAGES.dashboard;

  return (
    <div className="attendance-records-page" dir="rtl">
      <header className="attendance-records-page__header">
        <div className="attendance-records-page__header-row">
          <h1 className="attendance-records-page__title">צפייה בנוכחות</h1>
          <button
            type="button"
            className="attendance-btn attendance-btn--secondary"
            onClick={onBack}
          >
            חזרה לתפריט
          </button>
        </div>
      </header>

      <div className="attendance-records-page__content">
        <div className="attendance-records-page__search-wrap">
          <AttendanceSearch
            classPrefix="attendance-records-page"
            showToolbarTitle={false}
            searchButtonLabel="הצג"
            formatActivityLabel={formatActivityNameLabel}
            activities={activities}
            loadingActivities={loadingActivities}
            selectedActivityId={selectedActivityId}
            setSelectedActivityId={setSelectedActivityId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            handleSearch={handleSearch}
          />
        </div>

        {showInitialHint && (
          <div className="attendance-records-page__hint-card">
            <p className="attendance-records-page__hint">{INITIAL_HINT}</p>
          </div>
        )}

        {isPageLoading && (
          <p className="attendance-records-page__loading" role="status">
            {loadingMessage}
          </p>
        )}

        {error && !isPageLoading && (
          <div className="attendance-records-page__message-block attendance-records-page__message-block--error">
            <p
              className="attendance-records-page__message attendance-records-page__message--error"
              role="alert"
            >
              {error}
            </p>
          </div>
        )}

        {!isPageLoading && !error && hasRequestedData && renderPageContent()}
      </div>
    </div>
  );
}

export default AttendanceRecordsPage;
