import { formatActivityOptionLabel } from "../../services/attendance/attendanceService";
import "../../styles/attendance/AttendanceButtons.css";

function AttendanceSearch({
  classPrefix = "take-attendance-page",
  showToolbarTitle = true,
  toolbarTitle = "חיפוש נוכחות",
  searchButtonLabel = "חפש",
  activities,
  loadingActivities,
  selectedActivityId,
  setSelectedActivityId,
  selectedDate,
  setSelectedDate,
  handleSearch,
  formatActivityLabel = formatActivityOptionLabel,
}) {  return (
    <div className={`${classPrefix}__toolbar`}>
      {showToolbarTitle && toolbarTitle ? (
        <h2 className={`${classPrefix}__toolbar-title`}>{toolbarTitle}</h2>
      ) : null}

      <div className={`${classPrefix}__field`}>
        <label htmlFor={`${classPrefix}-activity-select`}>שם הפעולה</label>
        <select
          id={`${classPrefix}-activity-select`}
          value={selectedActivityId}
          onChange={(event) => setSelectedActivityId(event.target.value)}
          disabled={loadingActivities}
        >
          <option value="">
            {loadingActivities ? "טוען פעילויות..." : "בחרו פעילות"}
          </option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {formatActivityLabel(activity)}
            </option>
          ))}
        </select>
      </div>

      <div className={`${classPrefix}__field`}>
        <label htmlFor={`${classPrefix}-date`}>תאריך</label>
        <input
          id={`${classPrefix}-date`}
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </div>

      <button
        type="button"
        className={`attendance-btn attendance-btn--primary ${classPrefix}__search-btn`}
        onClick={handleSearch}
        disabled={loadingActivities}
      >
        {searchButtonLabel}
      </button>
    </div>
  );
}

export default AttendanceSearch;
