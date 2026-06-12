import { formatAttendancePercentage } from "../../services/attendance/attendanceService";

const ACTIVITY_CARDS = [
  { key: "totalRegistered", label: "נרשמים" },
  { key: "presentCount", label: "נוכחים", tone: "present" },
  { key: "absentCount", label: "נעדרים", tone: "absent" },
  {
    key: "attendancePercentage",
    label: "אחוז נוכחות",
    tone: "rate",
    format: formatAttendancePercentage,
  },
];

function AttendanceSummaryCards({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="attendance-records-page__summary-grid">
      {ACTIVITY_CARDS.map((card) => {
        const rawValue = summary[card.key];
        const value = card.format ? card.format(rawValue) : rawValue;

        return (
          <div
            key={card.key}
            className={`attendance-records-page__summary-card${
              card.tone
                ? ` attendance-records-page__summary-card--${card.tone}`
                : ""
            }`}
          >
            <span className="attendance-records-page__summary-label">
              {card.label}
            </span>
            <span className="attendance-records-page__summary-value">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

export default AttendanceSummaryCards;
