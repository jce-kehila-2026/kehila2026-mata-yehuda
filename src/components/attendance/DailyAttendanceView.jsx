import { formatActivityDisplayDate } from "../../services/attendance/attendanceService";
import DailySummaryCards from "./DailySummaryCards";
import DailyActivitySummaryList from "./DailyActivitySummaryList";

function DailyAttendanceView({ dailyData }) {
  if (!dailyData) {
    return null;
  }

  const displayDate = formatActivityDisplayDate(dailyData.date) || "—";

  return (
    <>
      <div className="attendance-records-page__section">
        <h2 className="attendance-records-page__section-title">
          סיכום יומי — {displayDate}
        </h2>
        <DailySummaryCards summary={dailyData.dailySummary} />
      </div>

      <div className="attendance-records-page__section">
        <h2 className="attendance-records-page__section-title">
          פעילויות בתאריך
        </h2>
        <DailyActivitySummaryList
          activitySummaries={dailyData.activitySummaries}
        />
      </div>
    </>
  );
}

export default DailyAttendanceView;
