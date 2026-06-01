import { formatDate, formatTime } from "../../utils/dateUtils";

function ActivityCard({ activity, onDelete, onEdit }) {


    return (
        <div className="activity-card">
            <h3>{activity.data.name}</h3>

            <p>תיאור: {activity.data.description}</p>

            <p>תאריך הפעולה: {formatDate(activity.data.start_date)}</p>
            <p>תאריך אחרון להרשמה: {formatDate(activity.data.registration_deadline)}</p>

            <p>שעת התחלה: {formatTime(activity.data.start_date)}</p>
            <p>שעת סיום: {formatTime(activity.data.end_date)}</p>

            <p>יום בשבוע: {activity.data.day_of_week}</p>
            <p>מספר משתתפים: {activity.data.max_participants}</p>
            <p>מחיר: {activity.data.price}</p>
            <p>הערות מחיר: {activity.data.price_note}</p>

            <p>סטטוס: {activity.data.is_open ? "פתוח" : "סגור"}</p>

            {activity.data.image_url && (
                <img
                    src={activity.data.image_url}
                    alt={activity.data.name}
                    width="200"
                />
            )}

            <button onClick={() => onDelete(activity.id)}>
                מחיקה
            </button>

            {onEdit && (
                <button onClick={() => onEdit(activity)}>
                    עריכה
                </button>
            )}
        </div>
    );
}

export default ActivityCard;