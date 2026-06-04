import { useState, useEffect } from "react";
import { buildStaffPage, staffNavigateBack } from "../utils/staffNavigation";
import {
    fetchActivities,
    addActivity,
    updateActivity,
    deleteActivity
} from "../services/activityService";

import ActivityForm from "../components/activities/ActivityForm";
import ActivityList from "../components/activities/ActivityList";

function ManageActivities({ activityView, onNavigate }) {
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingActivity, setEditingActivity] = useState(null);

    function handleEditActivity(activity) {
        setEditingActivity(activity);
        onNavigate(buildStaffPage("activities", "edit"));
    }

    function handleCancelEdit() {
        setEditingActivity(null);
        if (activityView === "edit") {
            staffNavigateBack();
        } else {
            onNavigate("activities");
        }
    }

    useEffect(() => {
        if (activityView !== "edit" && editingActivity) {
            setEditingActivity(null);
        }
    }, [activityView]);

    async function loadActivities() {
        const data = await fetchActivities();
        const missingCreatedAt = data.filter((activity) => !activity.data?.created_at);

        if (missingCreatedAt.length > 0) {
            console.log(
                "Activities missing created_at:",
                missingCreatedAt.map((activity) => ({
                    id: activity.id,
                    name: activity.data?.name
                }))
            );
        }

        setActivities(data);
    }

    async function handleAddActivity(activityData) {
        try {
            await addActivity(activityData);
            await loadActivities();
            setSuccess("הפעילות נוספה בהצלחה");
            setError("");
        } catch (error) {
            console.error("Activity add failed:", error);
            setError("אירעה שגיאה בהוספת הפעילות");
            setSuccess("");
        }
    }

    async function handleUpdateActivity(activityData) {
        console.log("Updating activity ID:", editingActivity?.id);
        console.log("Payload:", activityData);

        try {
            await updateActivity(editingActivity.id, activityData);
            await loadActivities();

            setSuccess("הפעילות עודכנה בהצלחה");
            setError("");
            setEditingActivity(null);
            if (activityView === "edit") {
                staffNavigateBack();
            } else {
                onNavigate("activities");
            }
        } catch (error) {
            console.error("Activity update failed:", error);
            setError("אירעה שגיאה בעדכון הפעילות");
            setSuccess("");
        }
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
        <div className="staff-page staff-page--activities">
            <header className="staff-header">
                <h1>ניהול פעילויות</h1>
            </header>

            <div className="staff-container">
                {error && <p className="staff-alert staff-alert--error">{error}</p>}
                {success && <p className="staff-alert staff-alert--success">{success}</p>}

                <section className="staff-section staff-section--form">
                    <h2>{editingActivity ? "עריכת פעילות" : "הוספת פעילות חדשה"}</h2>
                    <ActivityForm
                        onSubmit={
                            editingActivity ? handleUpdateActivity : handleAddActivity
                        }
                        editingActivity={editingActivity}
                        onCancelEdit={handleCancelEdit}
                    />
                </section>

                <section className="staff-section staff-section--list">
                    <h2>רשימת פעילויות</h2>
                    <ActivityList
                        activities={activities}
                        onDelete={handleDeleteActivity}
                        onEdit={handleEditActivity}
                    />
                </section>
            </div>
        </div>
    );
}

export default ManageActivities;
