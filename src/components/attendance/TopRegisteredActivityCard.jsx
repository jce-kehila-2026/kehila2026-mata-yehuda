import { formatActivityDisplayDate } from "../../services/attendance/attendanceService";

function TopRegisteredActivityCard({ activityStat, onSelect }) {
  const displayDate =
    formatActivityDisplayDate(activityStat.activityDate) || "—";

  const handleSelect = () => {
    onSelect?.(activityStat.activityId);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <button
      type="button"
      className="attendance-records-page__top-card"
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-label={`הצגת נוכחות עבור ${activityStat.activityName}`}
    >
      <span className="attendance-records-page__top-card-name">
        {activityStat.activityName}
      </span>
      <span className="attendance-records-page__top-card-date">{displayDate}</span>
      <span className="attendance-records-page__top-card-count">
        {activityStat.registeredCount} נרשמים
      </span>
    </button>
  );
}

export default TopRegisteredActivityCard;
