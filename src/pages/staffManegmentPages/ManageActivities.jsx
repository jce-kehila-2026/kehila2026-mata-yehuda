import { useState, useEffect } from "react";
import { buildStaffPage, staffNavigateBack } from "../../utils/staffManegmentUtils/staffNavigation";
import {
    addActivity,
    updateActivity,
    deleteActivity
} from "../../services/staffManegmentServices/activityService";

import ActivityForm from "../../components/activities/ActivityForm";
import ActivityList from "../../components/activities/ActivityList";

function ManageActivities({ activityView, onNavigate }) {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingActivity, setEditingActivity] = useState(null);
    const [listRefreshKey, setListRefreshKey] = useState(0);
    const activityPage = activityView || "list";

    function refreshActivityList() {
        setListRefreshKey((previous) => previous + 1);
    }

    function navigateToView(view) {
        onNavigate(buildStaffPage("activities", view));
    }

    function goBackToList() {
        setEditingActivity(null);
        if (activityPage === "list") {
            return;
        }

        staffNavigateBack();
    }

    function handleEditActivity(activity) {
        setEditingActivity(activity);
        navigateToView("edit");
    }

    function handleCancelEdit() {
        goBackToList();
    }

    function handleAddActivityClick() {
        setEditingActivity(null);
        navigateToView("add");
    }

    useEffect(() => {
        if (activityPage !== "edit") {
            setEditingActivity(null);
        }
    }, [activityPage]);

    async function handleAddActivity(activityData) {
        try {
            await addActivity(activityData);
            refreshActivityList();
            setSuccess("הפעילות נוספה בהצלחה");
            setError("");
            goBackToList();
        } catch (error) {
            console.error("Activity add failed:", error);
            setError("אירעה שגיאה בהוספת הפעילות");
            setSuccess("");
        }
    }

    async function handleUpdateActivity(activityData) {
        try {
            await updateActivity(editingActivity.id, activityData);
            refreshActivityList();

            setSuccess("הפעילות עודכנה בהצלחה");
            setError("");
            goBackToList();
        } catch (error) {
            console.error("Activity update failed:", error);
            setError("אירעה שגיאה בעדכון הפעילות");
            setSuccess("");
        }
    }

    async function handleDeleteActivity(activityId) {
        await deleteActivity(activityId);
        refreshActivityList();
        setSuccess("הפעילות נמחקה בהצלחה");
        setError("");
    }

    return (
        <div className="staff-page staff-page--activities">
            <div className="staff-container staff-container--activities">
                {error && <p className="staff-alert staff-alert--error">{error}</p>}
                {success && <p className="staff-alert staff-alert--success">{success}</p>}

                {activityPage === "list" && (
                    <section className="staff-section staff-section--list staff-section--activities-list">
                        <ActivityList
                            refreshKey={listRefreshKey}
                            onDelete={handleDeleteActivity}
                            onEdit={handleEditActivity}
                            onAddActivity={handleAddActivityClick}
                        />
                    </section>
                )}

                {(activityPage === "add" || activityPage === "edit") && (
                    <section className="staff-section staff-section--form">
                        <div className="staff-toolbar">
                            <button
                                type="button"
                                className="staff-button staff-button--secondary staff-button--small"
                                onClick={goBackToList}
                            >
                                חזרה לרשימת פעילויות
                            </button>
                        </div>

                        <h2>
                            {activityPage === "edit"
                                ? "עריכת פעילות"
                                : "הוספת פעילות חדשה"}
                        </h2>
                        <ActivityForm
                            onSubmit={
                                activityPage === "edit"
                                    ? handleUpdateActivity
                                    : handleAddActivity
                            }
                            editingActivity={
                                activityPage === "edit" ? editingActivity : null
                            }
                            onCancelEdit={handleCancelEdit}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}

export default ManageActivities;
