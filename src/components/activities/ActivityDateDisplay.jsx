import {
    formatActivityDateOnly,
    formatActivityWeekday
} from "../../utils/dateUtils";

function ActivityDateDisplay({ startDate, className = "" }) {
    const weekday = formatActivityWeekday(startDate);
    const dateOnly = formatActivityDateOnly(startDate);

    return (
        <span
            className={["activity-date-display", className].filter(Boolean).join(" ")}
        >
            <span className="activity-date-display__weekday">{weekday}</span>
            <span className="activity-date-display__separator" aria-hidden="true">
                ·
            </span>
            <span className="activity-date-display__date">{dateOnly}</span>
        </span>
    );
}

export default ActivityDateDisplay;
