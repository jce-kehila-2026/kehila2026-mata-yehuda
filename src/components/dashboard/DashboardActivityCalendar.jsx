import { useMemo, useState } from "react";
import ActivityDateDisplay from "../activities/ActivityDateDisplay";
import DashboardActivityCalendarModal from "./DashboardActivityCalendarModal";
import {
    buildMonthCalendarCells,
    formatHebrewMonthYear,
    getActivitiesInMonth,
    getActivityLocalDayKey,
    getUpcomingActivities,
    groupActivitiesByLocalDay,
    HEBREW_WEEKDAY_HEADERS
} from "../../utils/dashboardActivityCalendar";
import { startOfLocalDay } from "../../utils/dateUtils";

function DashboardPanelLink({ label, onClick, disabled }) {
    return (
        <div className="staff-dashboard-panel__footer">
            <button
                type="button"
                className="staff-dashboard-panel__link"
                onClick={onClick}
                disabled={disabled}
            >
                {label}
            </button>
        </div>
    );
}

function DashboardActivityCalendar({ activities = [], loading, onNavigate }) {
    const [viewDate, setViewDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [modalState, setModalState] = useState(null);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const todayStart = startOfLocalDay(new Date())?.getTime() ?? 0;

    const monthActivities = useMemo(
        () => getActivitiesInMonth(activities, year, month),
        [activities, year, month]
    );

    const activitiesByDay = useMemo(
        () => groupActivitiesByLocalDay(monthActivities),
        [monthActivities]
    );

    const calendarCells = useMemo(
        () => buildMonthCalendarCells(year, month),
        [year, month]
    );

    const upcomingActivities = useMemo(
        () => getUpcomingActivities(activities, 2),
        [activities]
    );

    const monthLabel = formatHebrewMonthYear(viewDate);
    const hasMonthActivities = monthActivities.length > 0;
    const upcomingLabel =
        upcomingActivities.length > 1
            ? "הפעילויות הקרובות:"
            : "הפעילות הקרובה:";

    function goToPreviousMonth() {
        setViewDate(
            (current) =>
                new Date(current.getFullYear(), current.getMonth() - 1, 1)
        );
    }

    function goToNextMonth() {
        setViewDate(
            (current) =>
                new Date(current.getFullYear(), current.getMonth() + 1, 1)
        );
    }

    function openActivitiesModal(dayActivities, title) {
        if (!dayActivities?.length) {
            return;
        }

        setModalState({
            activities: dayActivities,
            title: title ?? null
        });
    }

    function closeModal() {
        setModalState(null);
    }

    function handleDayClick(day) {
        if (!day) {
            return;
        }

        const dayKey = startOfLocalDay(new Date(year, month, day))?.getTime();
        const dayActivities =
            dayKey != null ? activitiesByDay.get(dayKey) ?? [] : [];

        if (dayActivities.length > 0) {
            const title =
                dayActivities.length === 1
                    ? dayActivities[0].data?.name || "פרטי פעילות"
                    : `פעילויות ב-${day} ב${monthLabel}`;
            openActivitiesModal(dayActivities, title);
        }
    }

    return (
        <>
            <section className="staff-dashboard-panel staff-dashboard-panel--calendar">
                <h3 className="staff-dashboard-panel__title">לוח פעילויות</h3>
                <div className="staff-dashboard-panel__body">
                    {loading ? (
                        <p className="staff-dashboard-panel__loading">טוען…</p>
                    ) : (
                        <>
                            <div className="staff-dashboard-calendar__nav">
                                <button
                                    type="button"
                                    className="staff-dashboard-calendar__nav-button staff-dashboard-calendar__nav-button--prev"
                                    onClick={goToPreviousMonth}
                                    aria-label="חודש קודם"
                                >
                                    <span className="staff-dashboard-calendar__nav-text">
                                        חודש קודם
                                    </span>
                                    <span
                                        className="staff-dashboard-calendar__nav-icon"
                                        aria-hidden="true"
                                    >
                                        →
                                    </span>
                                </button>
                                <span className="staff-dashboard-calendar__month">
                                    {monthLabel}
                                </span>
                                <button
                                    type="button"
                                    className="staff-dashboard-calendar__nav-button staff-dashboard-calendar__nav-button--next"
                                    onClick={goToNextMonth}
                                    aria-label="חודש הבא"
                                >
                                    <span
                                        className="staff-dashboard-calendar__nav-icon"
                                        aria-hidden="true"
                                    >
                                        ←
                                    </span>
                                    <span className="staff-dashboard-calendar__nav-text">
                                        חודש הבא
                                    </span>
                                </button>
                            </div>

                            <div className="staff-dashboard-calendar">
                                <div
                                    className="staff-dashboard-calendar__weekdays"
                                    aria-hidden="true"
                                >
                                    {HEBREW_WEEKDAY_HEADERS.map((label) => (
                                        <span
                                            key={label}
                                            className="staff-dashboard-calendar__weekday"
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                                <div className="staff-dashboard-calendar__grid">
                                    {calendarCells.map((day, index) => {
                                        if (!day) {
                                            return (
                                                <span
                                                    key={`empty-${index}`}
                                                    className="staff-dashboard-calendar__day staff-dashboard-calendar__day--empty"
                                                    aria-hidden="true"
                                                />
                                            );
                                        }

                                        const dayKey = getActivityLocalDayKey(
                                            new Date(year, month, day)
                                        );
                                        const dayActivities =
                                            dayKey != null
                                                ? activitiesByDay.get(dayKey) ?? []
                                                : [];
                                        const hasActivities =
                                            dayActivities.length > 0;
                                        const isToday =
                                            dayKey != null &&
                                            dayKey === todayStart;

                                        return (
                                            <button
                                                key={`${year}-${month}-${day}`}
                                                type="button"
                                                className={[
                                                    "staff-dashboard-calendar__day",
                                                    hasActivities &&
                                                        "staff-dashboard-calendar__day--has-activity",
                                                    isToday &&
                                                        "staff-dashboard-calendar__day--today"
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                onClick={() =>
                                                    handleDayClick(day)
                                                }
                                                disabled={!hasActivities}
                                                aria-label={
                                                    hasActivities
                                                        ? `${day} — ${dayActivities.length} פעילויות`
                                                        : `${day}`
                                                }
                                            >
                                                <span className="staff-dashboard-calendar__day-number">
                                                    {day}
                                                </span>
                                                {hasActivities ? (
                                                    <span
                                                        className="staff-dashboard-calendar__dot"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {!hasMonthActivities ? (
                                <p className="staff-dashboard-calendar__empty">
                                    אין פעילויות החודש
                                </p>
                            ) : null}

                            {upcomingActivities.length > 0 ? (
                                <div className="staff-dashboard-calendar__next">
                                    <span className="staff-dashboard-calendar__next-label">
                                        {upcomingLabel}
                                    </span>
                                    <ul className="staff-dashboard-calendar__next-list">
                                        {upcomingActivities.map((activity) => (
                                            <li key={activity.id}>
                                                <button
                                                    type="button"
                                                    className="staff-dashboard-calendar__next-item"
                                                    onClick={() =>
                                                        openActivitiesModal(
                                                            [activity],
                                                            activity.data
                                                                ?.name ||
                                                                "פרטי פעילות"
                                                        )
                                                    }
                                                >
                                                    <span className="staff-dashboard-calendar__next-name">
                                                        {activity.data?.name ||
                                                            "—"}
                                                    </span>
                                                    <span className="staff-dashboard-calendar__next-date">
                                                        <ActivityDateDisplay
                                                            startDate={
                                                                activity.data
                                                                    ?.start_date
                                                            }
                                                        />
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
                <DashboardPanelLink
                    label="צפייה בכל הפעילויות →"
                    onClick={() => onNavigate?.("activities")}
                    disabled={loading}
                />
            </section>

            {modalState ? (
                <DashboardActivityCalendarModal
                    activities={modalState.activities}
                    title={modalState.title}
                    onClose={closeModal}
                />
            ) : null}
        </>
    );
}

export default DashboardActivityCalendar;
