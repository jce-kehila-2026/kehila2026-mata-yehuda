import { formatDate, formatTime } from "../../utils/dateUtils";
import { hasDisplayNumber, hasFormattedDisplay, hasValue } from "../../utils/hasValue";

function ActivityCard({ activity, onDelete, onEdit }) {
    const data = activity.data;
    const imageUrl = data.image_url?.trim();
    const startDateLabel = formatDate(data.start_date);
    const registrationDeadlineLabel = formatDate(data.registration_deadline);
    const startTimeLabel = formatTime(data.start_date);
    const endTimeLabel = formatTime(data.end_date);

    return (
        <article className="staff-card activity-card">
            <div className="staff-card-body">
                {hasValue(data.name) && <h3>{data.name}</h3>}

                {hasValue(data.description) && <p>תיאור: {data.description}</p>}

                {hasFormattedDisplay(startDateLabel) && (
                    <p>תאריך הפעולה: {startDateLabel}</p>
                )}
                {hasFormattedDisplay(registrationDeadlineLabel) && (
                    <p>תאריך אחרון להרשמה: {registrationDeadlineLabel}</p>
                )}

                {hasFormattedDisplay(startTimeLabel) && (
                    <p>שעת התחלה: {startTimeLabel}</p>
                )}
                {hasFormattedDisplay(endTimeLabel) && (
                    <p>שעת סיום: {endTimeLabel}</p>
                )}

                {hasValue(data.day_of_week) && (
                    <p>יום בשבוע: {data.day_of_week}</p>
                )}
                {hasDisplayNumber(data.max_participants) && (
                    <p>מספר משתתפים: {data.max_participants}</p>
                )}
                {hasDisplayNumber(data.price) && <p>מחיר: {data.price}</p>}
                {hasValue(data.price_note) && <p>הערות מחיר: {data.price_note}</p>}

                <p>סטטוס: {data.is_open ? "פתוח" : "סגור"}</p>

                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={data.name || "פעילות"}
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                )}
            </div>

            <div className="activity-card-actions">
                {onEdit && (
                    <button
                        type="button"
                        className="staff-button staff-button--small staff-button--secondary"
                        onClick={() => onEdit(activity)}
                    >
                        עריכה
                    </button>
                )}
                <button
                    type="button"
                    className="staff-button staff-button--small staff-button--danger"
                    onClick={() => onDelete(activity.id)}
                >
                    מחיקה
                </button>
            </div>
        </article>
    );
}

export default ActivityCard;
