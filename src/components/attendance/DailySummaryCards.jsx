import { formatAttendancePercentage } from "../../services/attendanceService";

const DAILY_SUMMARY_CARDS = [
  { key: "totalActivities", label: "מספר פעילויות" },
  { key: "totalRegistered", label: "סך נרשמים" },
  { key: "presentCount", label: "סך נוכחים", tone: "present" },
  { key: "absentCount", label: "סך נעדרים", tone: "absent" },
  {
    key: "attendancePercentage",
    label: "אחוז נוכחות יומי",
    tone: "rate",
    format: formatAttendancePercentage,
  },
];

function DailySummaryCards({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="attendance-records-page__summary-grid attendance-records-page__summary-grid--daily">
      {DAILY_SUMMARY_CARDS.map((card) => {
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

export default DailySummaryCards;
