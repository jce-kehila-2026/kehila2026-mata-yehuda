import ActivityStatusBadge from "../activities/ActivityStatusBadge";
import { formatActivityOccupancy } from "../../services/activityService";
import {
    formatActivityDateOnly,
    formatActivityWeekday,
    formatTime
} from "../../utils/dateUtils";
import { hasDisplayNumber, hasValue } from "../../utils/hasValue";

function DashboardActivityDetailCard({ activity }) {
    const data = activity.data || {};
    const dateLabel = formatActivityDateOnly(data.start_date);
    const weekdayLabel = formatActivityWeekday(data.start_date);
    const startTimeLabel = formatTime(data.start_date);
    const endTimeLabel = formatTime(data.end_date);
    const showPrice = hasDisplayNumber(data.price);
    const showPriceNote = hasValue(data.price_note);

    return (
        <article className="staff-dashboard-activity-modal__card">
            <h4 className="staff-dashboard-activity-modal__card-title">
                {data.name || "—"}
            </h4>
            <dl className="staff-dashboard-activity-modal__details">
                {dateLabel !== "-" ? (
                    <>
                        <div className="staff-dashboard-activity-modal__detail">
                            <dt>תאריך</dt>
                            <dd>{dateLabel}</dd>
                        </div>
                        {weekdayLabel !== "-" ? (
                            <div className="staff-dashboard-activity-modal__detail">
                                <dt>יום בשבוע</dt>
                                <dd>{weekdayLabel}</dd>
                            </div>
                        ) : null}
                    </>
                ) : null}
                {startTimeLabel ? (
                    <div className="staff-dashboard-activity-modal__detail">
                        <dt>שעת התחלה</dt>
                        <dd>{startTimeLabel}</dd>
                    </div>
                ) : null}
                {endTimeLabel ? (
                    <div className="staff-dashboard-activity-modal__detail">
                        <dt>שעת סיום</dt>
                        <dd>{endTimeLabel}</dd>
                    </div>
                ) : null}
                <div className="staff-dashboard-activity-modal__detail">
                    <dt>משתתפים</dt>
                    <dd>{formatActivityOccupancy(data)}</dd>
                </div>
                <div className="staff-dashboard-activity-modal__detail staff-dashboard-activity-modal__detail--status">
                    <dt>סטטוס הרשמה</dt>
                    <dd>
                        <ActivityStatusBadge data={data} />
                    </dd>
                </div>
                {showPrice ? (
                    <div className="staff-dashboard-activity-modal__detail">
                        <dt>מחיר</dt>
                        <dd>{data.price}</dd>
                    </div>
                ) : null}
                {showPriceNote ? (
                    <div className="staff-dashboard-activity-modal__detail">
                        <dt>הערת מחיר</dt>
                        <dd>{data.price_note}</dd>
                    </div>
                ) : null}
            </dl>
        </article>
    );
}

function DashboardActivityCalendarModal({ activities, title, onClose }) {
    if (!activities?.length) {
        return null;
    }

    const modalTitle =
        title ||
        (activities.length === 1
            ? activities[0].data?.name || "פרטי פעילות"
            : `${activities.length} פעילויות`);

    return (
        <div
            className="staff-dashboard-activity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-activity-modal-title"
        >
            <div
                className="staff-dashboard-activity-modal__backdrop"
                onClick={onClose}
            />
            <div className="staff-dashboard-activity-modal__panel">
                <div className="staff-dashboard-activity-modal__header">
                    <h3 id="dashboard-activity-modal-title">{modalTitle}</h3>
                    <button
                        type="button"
                        className="staff-dashboard-activity-modal__close"
                        onClick={onClose}
                        aria-label="סגירה"
                    >
                        ×
                    </button>
                </div>
                <div className="staff-dashboard-activity-modal__body">
                    {activities.map((activity) => (
                        <DashboardActivityDetailCard
                            key={activity.id}
                            activity={activity}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardActivityCalendarModal;
