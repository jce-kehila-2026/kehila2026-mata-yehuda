import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "../../components/Homecomponents/ActivityCard";
import { getAllActivities } from "../../services/HomeServices/activitiesService";
import { PROGRAM_60_PLUS_MINUS_ID } from "../../utils/staffManegmentUtils/programConstants";
import { toActivityDate } from "../../utils/staffManegmentUtils/dateUtils";
import { isActivityDisplayOpen } from "../../utils/staffManegmentUtils/activityStatus";
import ActivityCalendar from "../../components/Homecomponents/ActivityCalendar";

import "../../styles/HomeStyle/Plus60Page.css";
import "../../styles/HomeStyle/ActivityCard.css";
import "../../styles/HomeStyle/Calendar.css";

function getActivityStartTime(activity) {
  const startDate = toActivityDate(activity?.start_date);
  return startDate ? startDate.getTime() : null;
}

function isUpcomingActivity(activity, now = new Date()) {
  const endDate = toActivityDate(activity?.end_date);
  const startDate = toActivityDate(activity?.start_date);
  const activityDate = endDate || startDate;

  return Boolean(activityDate && activityDate.getTime() >= now.getTime());
}

function sortUpcomingActivities(activities) {
  return [...activities].sort((left, right) => {
    const leftTime = getActivityStartTime(left);
    const rightTime = getActivityStartTime(right);

    if (leftTime == null && rightTime == null) {
      return 0;
    }

    if (leftTime == null) {
      return 1;
    }

    if (rightTime == null) {
      return -1;
    }

    return leftTime - rightTime;
  });
}

function isArchivedActivity(activity) {
  return (
    activity?.isArchived === true ||
    activity?.data?.isArchived === true ||
    activity?.data?.data?.isArchived === true
  );
}

function Plus60Page() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [viewMode, setViewMode] = useState("calendar");
  const [cardsVisibleCount, setCardsVisibleCount] = useState(6);
  const [upcomingVisibleCount, setUpcomingVisibleCount] = useState(3);

  const CARDS_PAGE_SIZE = 6;
  const UPCOMING_PAGE_SIZE = 3;

  useEffect(() => {
    async function loadActivities() {
      const data = await getAllActivities();

      const plus60Activities = sortUpcomingActivities(
        data.filter((activity) => {
          const activityProgramId =
            activity.program_id || activity.programId || "";
          return (
            !activityProgramId ||
            activityProgramId === PROGRAM_60_PLUS_MINUS_ID
          );
        })
      );
      setActivities(plus60Activities);
    }

    loadActivities();
  }, []);

  const displayActivities = useMemo(
    () =>
      sortUpcomingActivities(
        activities.filter(
          (activity) =>
            !isArchivedActivity(activity) &&
            isUpcomingActivity(activity) &&
            isActivityDisplayOpen(activity)
        )
      ),
    [activities]
  );

  const visibleCardsActivities = displayActivities.slice(
    0,
    cardsVisibleCount
  );
  const visibleUpcomingActivities = displayActivities.slice(
    0,
    upcomingVisibleCount
  );

  function handleShowMoreCards() {
    setCardsVisibleCount(displayActivities.length);
  }

  function handleShowLessCards() {
    setCardsVisibleCount(CARDS_PAGE_SIZE);
  }

  function handleShowMoreUpcoming() {
    setUpcomingVisibleCount(displayActivities.length);
  }

  function handleShowLessUpcoming() {
    setUpcomingVisibleCount(UPCOMING_PAGE_SIZE);
  }

  return (
    <div className="plus60-page">
      <section className="plus60-hero">
        <div className="plus60-hero__photo-wrap" aria-hidden="true">
          <img
            src="/images/community-staff-dashboard/people1.png"
            alt=""
            className="plus60-hero__photo"
          />
        </div>

        <img
          src="/images/community-staff-dashboard/kishot-clear.png"
          alt=""
          aria-hidden="true"
          className="plus60-hero__foliage"
        />

        <div className="plus60-hero__toolbar">
          <button
            className="cancel-btn"
            onClick={() =>
              navigate("/pay?cancelRegistration=1&returnTo=plus60")
            }
          >
            ביטול הרשמה
          </button>
          <button className="home-btn" onClick={() => navigate("/")}>
            חזרה לדף הבית
          </button>
        </div>

        <div className="plus60-hero__title-block">
          <img
            src="/images/community-staff-dashboard/smallheart-clear.png"
            alt=""
            aria-hidden="true"
            className="plus60-hero__heart"
          />
          <h1>לוח פעילויות</h1>
          <p>
            גלו את מגוון הפעילויות והסדנאות המרתקות שלנו. הרשמו בקלות
            לחוגים, מפגשים ואירועים מיוחדים המותאמים לחברי הקהילה.
          </p>
        </div>
      </section>

      <div className="plus60-main">
        <div
          className="plus60-view-tabs"
          role="tablist"
          aria-label="בחירת תצוגת פעילויות"
        >
          <button
            type="button"
            role="tab"
            id="plus60-tab-calendar"
            aria-selected={viewMode === "calendar"}
            aria-controls="plus60-panel-calendar"
            className={`plus60-view-tabs__tab${viewMode === "calendar" ? " plus60-view-tabs__tab--active" : ""
              }`}
            onClick={() => setViewMode("calendar")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M3 10h18M8 2v4M16 2v4" />
            </svg>
            תצוגת לוח שנה
          </button>
          <button
            type="button"
            role="tab"
            id="plus60-tab-cards"
            aria-selected={viewMode === "cards"}
            aria-controls="plus60-panel-cards"
            className={`plus60-view-tabs__tab${viewMode === "cards" ? " plus60-view-tabs__tab--active" : ""
              }`}
            onClick={() => setViewMode("cards")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="8" height="8" rx="1.5" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
            תצוגת הפעילויות
          </button>
        </div>

        {viewMode === "calendar" ? (
          <div
            id="plus60-panel-calendar"
            role="tabpanel"
            aria-labelledby="plus60-tab-calendar"
            className="plus60-main__panel"
          >
            <ActivityCalendar activities={displayActivities} />
          </div>
        ) : (
          <section
            id="plus60-panel-cards"
            role="tabpanel"
            aria-labelledby="plus60-tab-cards"
            className="plus60-main__panel plus60-cards-panel"
            aria-label="תצוגת כרטיסים"
          >
            {displayActivities.length === 0 ? (
              <p className="plus60-cards-panel__empty">
                אין פעילויות פתוחות להרשמה כרגע
              </p>
            ) : (
              <>
                <div className="plus60-activities-grid">
                  {visibleCardsActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      programId={PROGRAM_60_PLUS_MINUS_ID}
                    />
                  ))}
                </div>

                {displayActivities.length > CARDS_PAGE_SIZE && (
                  <div className="activities-actions">
                    {cardsVisibleCount < displayActivities.length ? (
                      <button
                        type="button"
                        className="show-more-circle"
                        onClick={handleShowMoreCards}
                        aria-label="הצג עוד פעילויות"
                      >
                        ↓
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="show-more-circle"
                        onClick={handleShowLessCards}
                        aria-label="הצג פחות פעילויות"
                      >
                        ↑
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>

      {viewMode === "calendar" && (
        <section className="plus60-upcoming" aria-label="הפעילויות הקרובות">
          <header className="plus60-upcoming__header">
            <h2>הפעילויות הקרובות</h2>
            <p>מומלץ להירשם מראש</p>
          </header>

          <div className="plus60-upcoming-panel">
            {displayActivities.length === 0 ? (
              <p className="plus60-upcoming-panel__empty">
                אין פעילויות פתוחות להרשמה כרגע
              </p>
            ) : (
              <>
                <div className="plus60-activities-grid">
                  {visibleUpcomingActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      programId={PROGRAM_60_PLUS_MINUS_ID}
                    />
                  ))}
                </div>

                {displayActivities.length > UPCOMING_PAGE_SIZE && (
                  <div className="activities-actions">
                    {upcomingVisibleCount < displayActivities.length ? (
                      <button
                        type="button"
                        className="show-more-circle"
                        onClick={handleShowMoreUpcoming}
                        aria-label="הצג עוד פעילויות קרובות"
                      >
                        ↓
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="show-more-circle"
                        onClick={handleShowLessUpcoming}
                        aria-label="הצג פחות פעילויות קרובות"
                      >
                        ↑
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default Plus60Page;
