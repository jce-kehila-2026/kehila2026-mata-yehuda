import { useState, useEffect } from "react";
import {
    fetchActivities,
    addActivity,
    updateActivity,
    deleteActivity
} from "../services/activityService";

import ActivityForm from "../components/activities/ActivityForm";
import ActivityCard from "../components/activities/ActivityCard";

function ManageActivities() {
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingActivity, setEditingActivity] = useState(null);

    function handleEditActivity(activity) {
        setEditingActivity(activity);
    }

    function handleCancelEdit() {
        setEditingActivity(null);
    }

    async function loadActivities() {
        const data = await fetchActivities();
        setActivities(data);
    }

    async function handleAddActivity(activityData) {
        await addActivity(activityData);
        await loadActivities();
        setSuccess("הפעילות נוספה בהצלחה");
        setError("");
    }

    async function handleUpdateActivity(activityData) {
        console.log("editingActivity:", editingActivity);
        console.log("updated data:", activityData);

        await updateActivity(editingActivity.id, activityData);
        await loadActivities();

        setSuccess("הפעילות עודכנה בהצלחה");
        setError("");
        setEditingActivity(null);
    }

    async function handleDeleteActivity(activityId) {
        await deleteActivity(activityId);
        await loadActivities();
        setSuccess("הפעילות נמחקה בהצלחה");
        setError("");
    }

    useEffect(() => {
        loadActivities();
    }, []);

    return (
        <div>
            <h1>ניהול פעילויות</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            {editingActivity ? (
                <h2>עריכת פעילות</h2>
            ) : (
                <h2>הוספת פעילות חדשה</h2>
            )}

            <ActivityForm
                onSubmit={editingActivity ? handleUpdateActivity : handleAddActivity}
                editingActivity={editingActivity}
                onCancelEdit={handleCancelEdit}
            />

            <h2>רשימת פעילויות</h2>

            <div className="activities-container">
                {activities.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onDelete={handleDeleteActivity}
                        onEdit={handleEditActivity}
                    />
                ))}
            </div>
        </div>
    );
}

export default ManageActivities;