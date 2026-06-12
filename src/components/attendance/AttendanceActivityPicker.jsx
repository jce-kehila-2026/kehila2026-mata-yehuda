import {
  formatActivityDisplayDate,
  getActivityDate,
  getActivityLocation,
  getActivityTime,
} from "../../services/attendance/attendanceService";
import "../../styles/attendance/AttendanceButtons.css";

function AttendanceActivityPicker({
  classPrefix = "take-attendance-page",
  activities,
  selectedActivityId,
  onSelectActivity,
}) {
  if (activities.length === 0) {
    return (
      <div className={`${classPrefix}__section`}>
        <div className={`${classPrefix}__card`}>
          <p className={`${classPrefix}__empty`}>לא נמצאו פעילויות בתאריך זה</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${classPrefix}__section`}>
      <h2 className={`${classPrefix}__section-title`}>בחרו פעילות</h2>

      <div className={`${classPrefix}__card ${classPrefix}__activity-list`}>
        {activities.map((activity) => {
          const activityDate = formatActivityDisplayDate(getActivityDate(activity));
          const activityTime = getActivityTime(activity);
          const activityLocation = getActivityLocation(activity);
          const isSelected = selectedActivityId === activity.id;

          return (
            <div
              key={activity.id}
              className={`${classPrefix}__activity-item${
                isSelected ? ` ${classPrefix}__activity-item--selected` : ""
              }`}
            >
              <div className={`${classPrefix}__activity-details`}>
                <span className={`${classPrefix}__activity-name`}>
                  {activity.name || "פעילות ללא שם"}
                </span>

                {activityDate && (
                  <span className={`${classPrefix}__activity-meta`}>
                    תאריך: {activityDate}
                  </span>
                )}

                {activityTime && (
                  <span className={`${classPrefix}__activity-meta`}>
                    שעה: {activityTime}
                  </span>
                )}

                {activityLocation && (
                  <span className={`${classPrefix}__activity-meta`}>
                    מיקום: {activityLocation}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`attendance-btn attendance-btn--primary ${classPrefix}__activity-select-btn`}
                onClick={() => onSelectActivity(activity)}
              >
                לקיחת נוכחות
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttendanceActivityPicker;
