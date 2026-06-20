import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "../../components/Homecomponents/ActivityCard";
import { getAllActivities } from "../../services/HomeServices/activitiesService";
import { PROGRAM_60_PLUS_MINUS_ID } from "../../utils/staffManegmentUtils/programConstants";
import { toActivityDate } from "../../utils/staffManegmentUtils/dateUtils";
import ActivityCalendar from "../../components/Homecomponents/ActivityCalendar"; 

import "../../styles/HomeStyle/Plus60Page.css";
import "../../styles/HomeStyle/ActivityCard.css";
import "../../styles/HomeStyle/Calendar.css";

function getActivityStartTime(activity) {
  const startDate = toActivityDate(activity?.start_date);
  return startDate ? startDate.getTime() : 0;
}

function sortActivitiesByStartDate(activities) {
  return [...activities].sort(
    (left, right) => getActivityStartTime(right) - getActivityStartTime(left)
  );
}

function Plus60Page() {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        async function loadActivities() {
        const data = await getAllActivities();

        const plus60Activities = sortActivitiesByStartDate(
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

      const visibleActivities = activities.slice(0, visibleCount);

      function handleShowMore() {
        setVisibleCount((prev) =>
          Math.min(prev + 3, activities.length)
        );
      }

      function handleShowLess() {
        setVisibleCount((prev) =>
          Math.max(prev - 3, 3)
        );
      }

    return (
    <div className="plus60-page">

        <div className="plus60-header">
        <div className="header-buttons">
        <button
          className="cancel-btn"
          onClick={() =>
            navigate("/pay?cancelRegistration=1&returnTo=plus60")
          }
        >
            ביטול הרשמה
        </button>
        <button
          className="home-btn"
          onClick={() => navigate("/")}
        >
          חזרה לדף הבית
        </button>
        </div>
        
        <div className="plus60-title">
            <h1>פעילויות</h1>
            <p>כל הפעילויות הזמינות במרכז</p>
        </div>
        </div>

        <div className="activities-grid">
        {visibleActivities.map((activity) => (
            <ActivityCard
            key={activity.id}
            activity={activity}
            programId={PROGRAM_60_PLUS_MINUS_ID}
            />
        ))}
        </div>

        {activities.length > 3 && (
        <div className="activities-actions">
          {visibleCount < activities.length ? (
            <button
              className="show-more-circle"
              onClick={handleShowMore}
            >
              ↓
            </button>
          ) : (
            <button
              className="show-more-circle"
              onClick={handleShowLess}
            >
              ↑
            </button>
          )}
        </div>
      )}

        <ActivityCalendar activities={activities} /> 
    </div>
    );
}

export default Plus60Page;
