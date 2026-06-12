import { formatActivityDisplayDate } from "../../services/attendance/attendanceService";

function DateMismatchNotice({ message, activityDate }) {
  if (!message) {
    return null;
  }

  const displayDate = formatActivityDisplayDate(activityDate) || "—";

  return (
    <div
      className="attendance-records-page__message-block attendance-records-page__message-block--warning"
      role="status"
    >
      <p className="attendance-records-page__message attendance-records-page__message--warning">
        {message}
      </p>
      <p className="attendance-records-page__message-meta">
        תאריך הפעילות: {displayDate}
      </p>
    </div>
  );
}

export default DateMismatchNotice;
