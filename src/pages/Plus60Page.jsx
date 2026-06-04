import { useEffect, useState } from "react";
import ActivityCard from "../components/ActivityCard";
import { getAllActivities } from "../services/activitiesService";

function Plus60Page() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        async function loadActivities() {
        const data = await getAllActivities();
        setActivities(data);
        }

        loadActivities();
    }, []);

    return (
    <div className="plus60-page">

        
        <h1>פעילויות</h1>
        <p>כל הפעילויות הזמינות במרכז</p>

        <button className="cancel-btn" onClick={() => alert("בקרוב")}>
        ביטול הרשמה
        </button>

        {activities.map((activity) => (
        <ActivityCard
            key={activity.id}
            activity={activity}
        />
        ))}

    </div>
    );
}

export default Plus60Page;