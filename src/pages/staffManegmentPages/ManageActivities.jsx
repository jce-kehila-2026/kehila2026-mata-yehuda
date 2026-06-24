import { useState, useEffect } from "react";
import { buildStaffPage, staffNavigateBack } from "../../utils/staffManegmentUtils/staffNavigation";
import {
    addActivity,
    updateActivity,
    deleteActivity
} from "../../services/staffManegmentServices/activityService";
import { ARCHIVE_CONFIRM_MESSAGE } from "../../utils/staffManegmentUtils/archiveUtils";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal";

import ActivityForm from "../../components/activities/ActivityForm";
import ActivityList from "../../components/activities/ActivityList";
import ArchiveActivitiesList from "../../components/archive/ArchiveActivitiesList";

function ManageActivities({ activityView, onNavigate }) {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingActivity, setEditingActivity] = useState(null);
    const [listRefreshKey, setListRefreshKey] = useState(0);
    const [pendingArchiveId, setPendingArchiveId] = useState(null);
    const [archiving, setArchiving] = useState(false);
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

    function handleViewArchive() {
        setError("");
        setSuccess("");
        navigateToView("archive");
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
        setPendingArchiveId(activityId);
    }

    async function confirmArchiveActivity() {
        if (!pendingArchiveId) {
            return;
        }

        setArchiving(true);

        try {
            await deleteActivity(pendingArchiveId);
            refreshActivityList();
            setSuccess("הפעילות הועברה לארכיון בהצלחה");
            setError("");
        } catch (error) {
            console.error("Activity archive failed:", error);
            setError("אירעה שגיאה בהעברת הפעילות לארכיון");
            setSuccess("");
        } finally {
            setArchiving(false);
            setPendingArchiveId(null);
        }
    }

    return (
        <div className="staff-page staff-page--activities">
            <div className="staff-container staff-container--activities">
                {error ? <p className="staff-alert staff-alert--error">{error}</p> : null}
                {success ? (
                    <p className="staff-alert staff-alert--success">{success}</p>
                ) : null}

                {activityPage === "list" && (
                    <section className="staff-section staff-section--list staff-section--activities-list">
                        <ActivityList
                            refreshKey={listRefreshKey}
                            onDelete={handleDeleteActivity}
                            onEdit={handleEditActivity}
                            onAddActivity={handleAddActivityClick}
                            onViewArchive={handleViewArchive}
                        />
                    </section>
                )}

                {activityPage === "archive" && (
                    <section className="staff-section staff-section--list staff-section--activities-archive">
                        <ArchiveActivitiesList
                            refreshKey={listRefreshKey}
                            onActionMessage={(message) => {
                                setSuccess(message);
                                setError("");
                                refreshActivityList();
                            }}
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

            <StaffConfirmModal
                message={pendingArchiveId ? ARCHIVE_CONFIRM_MESSAGE : ""}
                confirmLabel="העברה לארכיון"
                confirming={archiving}
                onConfirm={confirmArchiveActivity}
                onCancel={() => {
                    if (!archiving) {
                        setPendingArchiveId(null);
                    }
                }}
            />
        </div>
    );
}

export default ManageActivities;
