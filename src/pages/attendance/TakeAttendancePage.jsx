import { useEffect, useState } from "react";
import AttendanceSearch from "../../components/attendance/AttendanceSearch";
import AttendanceActivityPicker from "../../components/attendance/AttendanceActivityPicker";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import "../../styles/attendance/TakeAttendancePage.css";
import "../../styles/attendance/AttendanceButtons.css";

import {
  formatActivityDisplayDate,
  getActivityDate,
  getActivities,
  getActivitiesByDate,
  loadParticipantsForActivities,
  saveAttendance,
} from "../../services/attendance/attendanceService";

const DATE_MISMATCH_WARNING =
  "שימו לב: התאריך שנבחר אינו תואם לתאריך הפעילות. מוצגת הנוכחות עבור הפעילות שנבחרה.";

function TakeAttendancePage({ onBack }) {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [matchedActivities, setMatchedActivities] = useState([]);
  const [activeActivity, setActiveActivity] = useState(null);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [isDateOnlyFlow, setIsDateOnlyFlow] = useState(false);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });
  const [showTakeAnother, setShowTakeAnother] = useState(false);

  const showMessage = (type, text) => {
    setPageMessage({ type, text });
  };

  const clearMessage = () => {
    setPageMessage({ type: "", text: "" });
  };

  const resetToInitialSearchState = () => {
    clearMessage();
    setShowTakeAnother(false);
    setSelectedActivityId("");
    setSelectedDate("");
    setMatchedActivities([]);
    setActiveActivity(null);
    setShowActivityPicker(false);
    setIsDateOnlyFlow(false);
    setFilteredParticipants([]);
    setHasSearched(false);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchActivities() {
      setLoadingActivities(true);

      try {
        const allActivities = await getActivities();

        if (isMounted) {
          setActivities(allActivities);
        }
      } catch (error) {
        console.error("Error loading activities:", error);

        if (isMounted) {
          showMessage("error", "אירעה שגיאה בטעינת הפעילויות");
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

  const loadParticipantsForSingleActivity = async (activity) => {
    setLoadingParticipants(true);
    setShowTakeAnother(false);

    try {
      const participants = await loadParticipantsForActivities(
        [activity],
        selectedDate || getActivityDate(activity)
      );

      setActiveActivity(activity);
      setFilteredParticipants(participants);
      setShowActivityPicker(false);
      setHasSearched(true);
    } catch (error) {
      console.error("Error loading activity participants:", error);
      showMessage("error", "אירעה שגיאה בטעינת המשתתפים");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedActivityId && !selectedDate) {
      showMessage("error", "נא לבחור פעילות או תאריך.");
      return;
    }

    try {
      clearMessage();
      setShowTakeAnother(false);
      setHasSearched(true);
      setActiveActivity(null);
      setFilteredParticipants([]);
      setShowActivityPicker(false);

      if (!selectedActivityId && selectedDate) {
        const activitiesOnDate = getActivitiesByDate(activities, selectedDate);

        if (activitiesOnDate.length === 0) {
          setMatchedActivities([]);
          showMessage("error", "לא נמצאה פעילות מתאימה");
          return;
        }

        setMatchedActivities(activitiesOnDate);
        setIsDateOnlyFlow(true);
        setShowActivityPicker(true);
        return;
      }

      setIsDateOnlyFlow(false);

      const selectedActivity = activities.find(
        (activity) => activity.id === selectedActivityId
      );

      if (!selectedActivity) {
        setMatchedActivities([]);
        showMessage("error", "לא נמצאה פעילות מתאימה");
        return;
      }

      if (
        selectedActivityId &&
        selectedDate &&
        getActivityDate(selectedActivity) !== selectedDate
      ) {
        showMessage("warning", DATE_MISMATCH_WARNING);
      }

      setMatchedActivities([selectedActivity]);
      await loadParticipantsForSingleActivity(selectedActivity);
    } catch (error) {
      console.error("Error searching attendance data:", error);
      showMessage("error", "אירעה שגיאה בחיפוש");
    }
  };

  const handleActivitySelect = async (activity) => {
    clearMessage();
    setShowTakeAnother(false);
    await loadParticipantsForSingleActivity(activity);
  };

  const handleBackToActivityList = () => {
    clearMessage();
    setShowTakeAnother(false);
    setActiveActivity(null);
    setFilteredParticipants([]);
    setShowActivityPicker(true);
  };

  const activeActivityDateLabel = formatActivityDisplayDate(
    getActivityDate(activeActivity)
  );

  const handleStatusChange = (id, newStatus) => {
    const updatedParticipants = filteredParticipants.map((participant) => {
      if (participant.registrationId === id) {
        return { ...participant, status: newStatus };
      }

      return participant;
    });

    setFilteredParticipants(updatedParticipants);
  };

  const handleNotesChange = (id, notes) => {
    const updatedParticipants = filteredParticipants.map((participant) => {
      if (participant.registrationId === id) {
        return { ...participant, notes };
      }

      return participant;
    });

    setFilteredParticipants(updatedParticipants);
  };

  const handleSaveAttendance = async () => {
    try {
      const fallbackDate =
        selectedDate || getActivityDate(activeActivity) || "";

      await saveAttendance(filteredParticipants, fallbackDate, "");

      setActiveActivity(null);
      setFilteredParticipants([]);
      setShowActivityPicker(false);
      setSelectedActivityId("");
      setMatchedActivities([]);
      setIsDateOnlyFlow(false);
      setHasSearched(false);
      setShowTakeAnother(true);
      showMessage("success", "הנוכחות נשמרה בהצלחה.");
    } catch (error) {
      console.error("Error saving attendance:", error);
      showMessage("error", "אירעה שגיאה בשמירת הנוכחות");
    }
  };

  const handleShowMessage = (type, text) => {
    showMessage(type, text);
  };

  const handleTakeAnotherAttendance = () => {
    resetToInitialSearchState();
  };

  const showInitialEmptyState =
    !pageMessage.text &&
    !showActivityPicker &&
    !loadingParticipants &&
    !activeActivity &&
    !hasSearched;

  return (
    <div className="take-attendance-page" dir="rtl">
      <header className="take-attendance-page__header">
        <div className="take-attendance-page__header-row">
          <h1 className="take-attendance-page__title">לקיחת נוכחות</h1>
          <button
            type="button"
            className="attendance-btn attendance-btn--secondary"
            onClick={onBack}
          >
            חזרה לתפריט
          </button>
        </div>
      </header>

      <div className="take-attendance-page__content">
        <div className="take-attendance-page__search-wrap">
          <AttendanceSearch
            classPrefix="take-attendance-page"
            showToolbarTitle={false}
            activities={activities}
            loadingActivities={loadingActivities}
            selectedActivityId={selectedActivityId}
            setSelectedActivityId={setSelectedActivityId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            handleSearch={handleSearch}
          />
        </div>

        {showInitialEmptyState && (
          <div className="take-attendance-page__hint-card">
            <p className="take-attendance-page__hint">
              בחרו פעילות או תאריך כדי להתחיל.
            </p>
          </div>
        )}

        {pageMessage.text && (
          <div
            className={`take-attendance-page__message-block take-attendance-page__message-block--${pageMessage.type}`}
          >
            <p
              className={`take-attendance-page__message take-attendance-page__message--${pageMessage.type}`}
              role={pageMessage.type === "error" ? "alert" : "status"}
            >
              {pageMessage.text}
            </p>

            {pageMessage.type === "success" && showTakeAnother && (
              <button
                type="button"
                className="attendance-btn attendance-btn--primary"
                onClick={handleTakeAnotherAttendance}
              >
                לקיחת נוכחות נוספת
              </button>
            )}
          </div>
        )}

        {showActivityPicker && (
          <AttendanceActivityPicker
            classPrefix="take-attendance-page"
            activities={matchedActivities}
            selectedActivityId={activeActivity?.id || ""}
            onSelectActivity={handleActivitySelect}
          />
        )}

        {loadingParticipants && (
          <p className="take-attendance-page__loading">טוען משתתפים...</p>
        )}

        {!showActivityPicker && !loadingParticipants && activeActivity && (
          <>
            <div className="take-attendance-page__attendance-context">
              <div className="take-attendance-page__context-summary">
                <p className="take-attendance-page__context-label">נוכחות עבור:</p>
                <p className="take-attendance-page__context-activity">
                  {activeActivity.name || "פעילות"}
                </p>
                <p className="take-attendance-page__context-date">
                  {activeActivityDateLabel}
                </p>
              </div>

              {isDateOnlyFlow && (
                <button
                  type="button"
                  className="attendance-btn attendance-btn--secondary"
                  onClick={handleBackToActivityList}
                >
                  בחירת פעילות אחרת
                </button>
              )}
            </div>

            <AttendanceTable
              classPrefix="take-attendance-page"
              participants={filteredParticipants}
              handleStatusChange={handleStatusChange}
              handleNotesChange={handleNotesChange}
              saveAttendance={handleSaveAttendance}
              onShowMessage={handleShowMessage}
              hasSearched={hasSearched}
              showActivityColumn={false}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default TakeAttendancePage;
