import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "../../components/Homecomponents/ActivityCard";
import { getAllActivities } from "../../services/HomeServices/activitiesService";
import { PROGRAM_60_PLUS_MINUS_ID } from "../../utils/staffManegmentUtils/programConstants";
import ActivityCalendar from "../../components/Homecomponents/ActivityCalendar"; 

import "../../styles/HomeStyle/Plus60Page.css";
import "../../styles/HomeStyle/ActivityCard.css";
import "../../styles/HomeStyle/Calendar.css";
function Plus60Page() {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        async function loadActivities() {
        const data = await getAllActivities();
        const plus60Activities = data.filter((activity) => {
          const activityProgramId =
            activity.program_id || activity.programId || "";
          return (
            !activityProgramId ||
            activityProgramId === PROGRAM_60_PLUS_MINUS_ID
          );
        });
        setActivities(plus60Activities);
        }

        loadActivities();
    }, []);

    return (
    <div className="plus60-page">

        <div className="plus60-header">
        <button
          className="cancel-btn"
          onClick={() =>
            navigate("/pay?cancelRegistration=1&returnTo=plus60")
          }
        >
            ביטול הרשמה
        </button>

        <div className="plus60-title">
            <h1>פעילויות</h1>
            <p>כל הפעילויות הזמינות במרכז</p>
        </div>
        </div>

        <div className="activities-grid">
        {activities.map((activity) => (
            <ActivityCard
            key={activity.id}
            activity={activity}
            programId={PROGRAM_60_PLUS_MINUS_ID}
            />
        ))}
        </div>

        <ActivityCalendar activities={activities} /> 
    </div>
    );
}

export default Plus60Page;
