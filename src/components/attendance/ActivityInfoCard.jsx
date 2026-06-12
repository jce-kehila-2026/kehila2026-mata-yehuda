import { formatActivityDisplayDate } from "../../services/attendance/attendanceService";

function ActivityInfoCard({ activity }) {
  if (!activity) {
    return null;
  }

  return (
    <div className="attendance-records-page__activity-info">
      <p className="attendance-records-page__activity-info-label">פעילות:</p>
      <p className="attendance-records-page__activity-info-name">{activity.name}</p>
      <p className="attendance-records-page__activity-info-date">
        {formatActivityDisplayDate(activity.date) || "—"}
      </p>
    </div>
  );
}

export default ActivityInfoCard;
