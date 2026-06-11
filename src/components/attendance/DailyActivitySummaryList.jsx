import AttendanceSummaryCards from "./AttendanceSummaryCards";

function DailyActivitySummaryList({ activitySummaries }) {
  if (!activitySummaries.length) {
    return (
      <div className="attendance-records-page__card">
        <p className="attendance-records-page__empty">
          לא נמצאו פעילויות בתאריך שנבחר.
        </p>
      </div>
    );
  }

  return (
    <div className="attendance-records-page__daily-activities">
      {activitySummaries.map((activityStat) => (
        <section
          key={activityStat.activityId}
          className="attendance-records-page__daily-activity-block"
        >
          <h3 className="attendance-records-page__daily-activity-name">
            {activityStat.activityName}
          </h3>
          <AttendanceSummaryCards
            summary={{
              totalRegistered: activityStat.registeredCount,
              presentCount: activityStat.presentCount,
              absentCount: activityStat.absentCount,
              attendancePercentage: activityStat.attendancePercentage,
            }}
          />
        </section>
      ))}
    </div>
  );
}

export default DailyActivitySummaryList;
