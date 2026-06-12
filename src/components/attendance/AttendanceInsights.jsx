import { formatAttendancePercentage } from "../../services/attendance/attendanceService";

function AttendanceInsights({ insights }) {
  if (!insights) {
    return null;
  }

  const {
    mostRegistered,
    topAttendance,
    hasRegistrationData,
    hasAttendanceData,
  } = insights;

  const showMostRegistered = hasRegistrationData || mostRegistered;
  const showTopAttendance = hasAttendanceData && topAttendance;

  if (!showMostRegistered && !showTopAttendance) {
    return (
      <div className="attendance-records-page__insights">
        <div className="attendance-records-page__insight-card attendance-records-page__insight-card--empty">
          <p className="attendance-records-page__insight-empty">
            טרם קיימים נתוני נוכחות
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-records-page__insights">
      {showMostRegistered && (
        <div className="attendance-records-page__insight-card">
          <h2 className="attendance-records-page__insight-title">
            הפעילות עם מספר הנרשמים הגבוה ביותר
          </h2>

          {mostRegistered ? (
            <>
              <p className="attendance-records-page__insight-value">
                {mostRegistered.activityName}
              </p>
              <p className="attendance-records-page__insight-meta">
                {mostRegistered.registeredCount} נרשמים
              </p>
            </>
          ) : (
            <p className="attendance-records-page__insight-empty">
              אין מספיק נתונים להצגת סטטיסטיקה
            </p>
          )}
        </div>
      )}

      {showTopAttendance && (
        <div className="attendance-records-page__insight-card">
          <h2 className="attendance-records-page__insight-title">
            הפעילות עם אחוז הנוכחות הגבוה ביותר
          </h2>
          <p className="attendance-records-page__insight-value">
            {topAttendance.activityName}
          </p>
          <p className="attendance-records-page__insight-meta">
            {formatAttendancePercentage(topAttendance.attendancePercentage)}
          </p>
        </div>
      )}
    </div>
  );
}

export default AttendanceInsights;
