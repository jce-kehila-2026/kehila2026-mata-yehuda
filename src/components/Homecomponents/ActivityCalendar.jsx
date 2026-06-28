import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getActivityColorIndex } from "../../utils/HomeUtils/activityColorUtils";
import { isFreeActivityData } from "../../utils/HomeUtils/activityPricing";
import { formatActivityPrice } from "../../services/Payment/formatPrice";

function ActivityCalendar({ activities }) {
  const navigate = useNavigate();
  const layoutRef = useRef(null);
  const mainRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [focusedActivityId, setFocusedActivityId] = useState(null);

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

  function handleSelectDay(date) {
    setSelectedDate(date);
    setFocusedActivityId(null);
  }

  function handleSelectActivity(date, activityId) {
    setSelectedDate(date);
    setFocusedActivityId(activityId);
  }

  const selectedDayActivities = selectedDate
    ? getActivitiesByDate(selectedDate)
    : [];

  useEffect(() => {
    const mainEl = mainRef.current;
    const layoutEl = layoutRef.current;

    if (!mainEl || !layoutEl) {
      return;
    }

    function syncCalendarHeight() {
      layoutEl.style.setProperty(
        "--calendar-main-height",
        `${mainEl.offsetHeight}px`
      );
    }

    syncCalendarHeight();

    const resizeObserver = new ResizeObserver(syncCalendarHeight);
    resizeObserver.observe(mainEl);
    window.addEventListener("resize", syncCalendarHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncCalendarHeight);
    };
  }, [activities, selectedDate]);

  useEffect(() => {
    if (!focusedActivityId) {
      return;
    }

    document
      .getElementById(`calendar-activity-${focusedActivityId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedActivityId, selectedDate]);

  return (
    <div className="activities-calendar">
      <h2>לוח פעילויות</h2>

      <div className="activities-calendar__layout" ref={layoutRef}>
        <div className="activities-calendar__main" ref={mainRef}>
          <div className="activities-calendar__card">
            <div className="activities-calendar__card-header">
              <h3 className="activities-calendar__card-title">לוח שנה</h3>
              <p className="activities-calendar__today-hint">
                לחצו על פעילות או על יום לצפייה בפרטים
              </p>
            </div>

            <Calendar
              locale="he-IL"
              value={selectedDate}
              onClickDay={handleSelectDay}
              tileClassName={({ date, view }) => {
                if (view !== "month") {
                  return null;
                }

                if (getActivitiesByDate(date).length > 0) {
                  return "react-calendar__tile--has-activity";
                }

                return null;
              }}
              tileContent={({ date, view }) => {
                if (view !== "month") {
                  return null;
                }

                const dayActivities = getActivitiesByDate(date);

                return (
                  <div className="calendar-tile-events">
                    {dayActivities.slice(0, 3).map((activity) => {
                      const colorIndex = getActivityColorIndex(activity.id);
                      const start = activity.start_date?.toDate?.();
                      const timeLabel = start
                        ? start.toLocaleTimeString("he-IL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";

                      return (
                        <button
                          key={activity.id}
                          type="button"
                          className={`calendar-activity-pill calendar-activity-pill--${colorIndex}${
                            focusedActivityId === activity.id &&
                            selectedDate &&
                            formatDate(selectedDate) === formatDate(date)
                              ? " calendar-activity-pill--active"
                              : ""
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleSelectActivity(date, activity.id);
                          }}
                        >
                          <span className="calendar-activity-pill__text">
                            <span className="calendar-activity-pill__name">
                              {activity.name}
                            </span>
                            {timeLabel ? (
                              <span className="calendar-activity-pill__time">
                                {timeLabel}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>
        </div>

        <aside className="activities-calendar__sidebar" aria-live="polite">
          {selectedDate ? (
            <div className="calendar-sidebar-panel">
              <button
                className="popup-close"
                onClick={() => {
                  setSelectedDate(null);
                  setFocusedActivityId(null);
                }}
                aria-label="סגירת פאנל הפעילויות"
              >
                ×
              </button>

              <h3>
                {selectedDate.toLocaleDateString("he-IL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>

              <p className="calendar-sidebar-panel__count">
                {selectedDayActivities.length === 0
                  ? "אין אירועים ביום זה"
                  : `${selectedDayActivities.length} אירועים ביום זה`}
              </p>

              {selectedDayActivities.length === 0 ? (
                <p className="calendar-sidebar-panel__empty-day">
                  אין פעילויות ביום זה
                </p>
              ) : (
                <div className="calendar-sidebar-panel__list">
                  {selectedDayActivities.map((activity) => {
                    const start = activity.start_date.toDate();
                    const end = activity.end_date.toDate();

                    return (
                      <div
                        key={activity.id}
                        id={`calendar-activity-${activity.id}`}
                        className={`calendar-sidebar-card${
                          focusedActivityId === activity.id
                            ? " calendar-sidebar-card--focused"
                            : ""
                        }`}
                      >
                        <div className="calendar-sidebar-card__head">
                          <div>
                            <strong>{activity.name}</strong>
                            <p className="calendar-sidebar-card__meta">
                              <span>
                                {start.toLocaleTimeString("he-IL", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {" - "}
                                {end.toLocaleTimeString("he-IL", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span>
                                {formatActivityPrice(activity.price)}
                              </span>
                            </p>
                          </div>
                        </div>

                        {activity.description && (
                          <p className="calendar-sidebar-card__desc">
                            {activity.description}
                          </p>
                        )}

                        <button
                          type="button"
                          className="calendar-sidebar-card__register"
                          onClick={() => {
                            const params = new URLSearchParams({
                              activityId: activity.id,
                            });
                            const programId =
                              activity.program_id || activity.programId || "";
                            if (programId) {
                              params.set("programId", programId);
                            }
                            if (isFreeActivityData(activity)) {
                              params.set("free", "1");
                            }
                            navigate(`/pay?${params.toString()}`);
                          }}
                        >
                          להרשמה
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="calendar-sidebar-panel calendar-sidebar-panel--empty">
              <p>בחרו יום או פעילות בלוח השנה לצפייה בפרטים</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ActivityCalendar;
