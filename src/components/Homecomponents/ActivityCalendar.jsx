import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function ActivityCalendar({ activities }) {
  const [selectedDate, setSelectedDate] = useState(null);

    function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
    }

  function getActivitiesByDate(date) {
    const selected = formatDate(date);

    return activities.filter((activity) => {
      if (!activity.start_date) return false;

      const activityDate = activity.start_date.toDate();
      return formatDate(activityDate) === selected;
    });
  }

  return (
    <div className="activities-calendar">
      <h2>לוח פעילויות</h2>

      <Calendar
        onClickDay={(date) => setSelectedDate(date)}
        tileContent={({ date }) => {
          const dayActivities = getActivitiesByDate(date);

          return (
            <div>
              {dayActivities.map((activity) => (
                <p key={activity.id} className="calendar-activity-name">
                  {activity.name}
                </p>
              ))}
            </div>
          );
        }}
      />

    {selectedDate && (
    <div className="calendar-popup">
        <div className="calendar-popup-box">
        <button
            className="popup-close"
            onClick={() => setSelectedDate(null)}
        >
            ×
        </button>

        <h3>פעילויות ביום שנבחר</h3>

        {getActivitiesByDate(selectedDate).length === 0 ? (
            <p>אין פעילויות ביום זה</p>
        ) : (
            getActivitiesByDate(selectedDate).map((activity) => {
            const start = activity.start_date.toDate();
            const end = activity.end_date.toDate();

            return (
                <div key={activity.id}>
                <strong>{activity.name}</strong>
                <p>
                    שעה:{" "}
                    {start.toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    })}
                    {" - "}
                    {end.toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    })}
                </p>
                </div>
            );
            })
        )}
        </div>
    </div>
    )}
    </div>
  );
}

export default ActivityCalendar;