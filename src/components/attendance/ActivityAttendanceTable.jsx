import {
  formatActivityDisplayDate,
  formatAttendancePercentage,
} from "../../services/attendance/attendanceService";

function ActivityAttendanceTable({ activityStats, onActivitySelect }) {
  if (!activityStats.length) {
    return (
      <div className="attendance-records-page__section">
        <h2 className="attendance-records-page__section-title">סיכום פעילויות</h2>
        <div className="attendance-records-page__card">
          <p className="attendance-records-page__empty">לא נמצאו רשומות נוכחות.</p>
        </div>
      </div>
    );
  }

  const handleRowSelect = (activityId) => {
    onActivitySelect?.(activityId);
  };

  const handleRowKeyDown = (event, activityId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRowSelect(activityId);
    }
  };

  return (
    <div className="attendance-records-page__section">
      <h2 className="attendance-records-page__section-title">סיכום פעילויות</h2>

      <div className="attendance-records-page__card">
        <div className="attendance-records-page__table-wrapper">
          <table className="attendance-records-page__table">
            <thead>
              <tr>
                <th>פעילות</th>
                <th>תאריך</th>
                <th>נרשמים</th>
                <th>נוכחים</th>
                <th>נעדרים</th>
                <th>אחוז נוכחות</th>
              </tr>
            </thead>

            <tbody>
              {activityStats.map((activityStat) => (
                <tr
                  key={activityStat.activityId}
                  className="attendance-records-page__row attendance-records-page__row--clickable"
                  onClick={() => handleRowSelect(activityStat.activityId)}
                  onKeyDown={(event) =>
                    handleRowKeyDown(event, activityStat.activityId)
                  }
                  tabIndex={0}
                  role="button"
                  aria-label={`הצגת נוכחות עבור ${activityStat.activityName}`}
                >
                  <td data-label="פעילות">{activityStat.activityName}</td>
                  <td data-label="תאריך">
                    {formatActivityDisplayDate(activityStat.activityDate) || "—"}
                  </td>
                  <td data-label="נרשמים">{activityStat.registeredCount}</td>
                  <td data-label="נוכחים">{activityStat.presentCount}</td>
                  <td data-label="נעדרים">{activityStat.absentCount}</td>
                  <td data-label="אחוז נוכחות">
                    {formatAttendancePercentage(activityStat.attendancePercentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ActivityAttendanceTable;
