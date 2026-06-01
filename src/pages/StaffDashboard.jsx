import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import ManageActivities from "./ManageActivities";
import ManageStaff from "./ManageStaff";
import ManagePrograms from "./ManagePrograms";
import ManageParticipants from "./ManageParticipants";
import ViewRequests from "./ViewRequests";
import ManageCancellations from "./ManageCancellations";

const TEAMMATE_PAGE_TOOLTIP = "העמוד יחובר לאחר מיזוג עם הצוות";

function StaffDashboard({ onLogout }) {
    const [currentPage, setCurrentPage] = useState("dashboard");

    async function handleLogout() {
        await signOut(auth);
        onLogout();
        console.log("logout clicked");
    }

    function goToPage(page) {
        setCurrentPage(page);
    }

    function renderBackToDashboard() {
        return (
            <button type="button" onClick={() => goToPage("dashboard")}>
                חזרה ללוח הבקרה
            </button>
        );
    }

    function renderPlaceholderPage(title) {
        return (
            <div data-dashboard-page={currentPage}>
                {renderBackToDashboard()}
                <h2>{title}</h2>
                <p>העמוד בפיתוח</p>
            </div>
        );
    }

    function renderCurrentPage() {
        switch (currentPage) {
            case "activities":
                return (
                    <div data-dashboard-page="activities">
                        {renderBackToDashboard()}
                        <ManageActivities />
                    </div>
                );
            case "manageStaff":
                return (
                    <div data-dashboard-page="manageStaff">
                        {renderBackToDashboard()}
                        <ManageStaff />
                    </div>
                );
            case "programs":
                return (
                    <div data-dashboard-page="programs">
                        {renderBackToDashboard()}
                        <ManagePrograms />
                    </div>
                );
            case "manageParticipants":
                return (
                    <div data-dashboard-page="manageParticipants">
                        {renderBackToDashboard()}
                        <ManageParticipants />
                    </div>
                );
            case "requests":
                return (
                    <div data-dashboard-page="requests">
                        {renderBackToDashboard()}
                        <ViewRequests />
                    </div>
                );
            case "cancellations":
                return (
                    <div data-dashboard-page="cancellations">
                        {renderBackToDashboard()}
                        <ManageCancellations />
                    </div>
                );
            case "notifications":
                return renderPlaceholderPage("שליחת הודעות");
            case "statistics":
                return renderPlaceholderPage("צפייה בסטטיסטיקות");
            case "attendance":
                return renderPlaceholderPage("בדיקת נוכחות");
            case "dashboard":
                return null;
            default:
                return (
                    <div data-dashboard-page={currentPage}>
                        {renderBackToDashboard()}
                        <p>עמוד לא נמצא</p>
                    </div>
                );
        }
    }

    return (
        <div>
            <h1>ברוך הבא צוות</h1>
            <button type="button" onClick={handleLogout}>
                התנתקות
            </button>

            {currentPage === "dashboard" && (
                <div className="dashboard-buttons">
                    <button type="button" onClick={() => goToPage("activities")}>
                        ניהול פעילויות חד פעמיות
                    </button>

                    <button type="button" onClick={() => goToPage("programs")}>
                        ניהול תוכניות
                    </button>

                    <button type="button" onClick={() => goToPage("manageStaff")}>
                        ניהול אנשי צוות
                    </button>

                    <button
                        type="button"
                        onClick={() => goToPage("manageParticipants")}
                    >
                        ניהול משתתפים
                    </button>

                    <button type="button" onClick={() => goToPage("notifications")}>
                        שליחת הודעות
                    </button>

                    <button type="button" onClick={() => goToPage("statistics")}>
                        צפייה בסטטיסטיקות
                    </button>

                    <button type="button" onClick={() => goToPage("requests")}>
                        צפייה בבקשות
                    </button>

                    <button
                        type="button"
                        disabled
                        title={TEAMMATE_PAGE_TOOLTIP}
                    >
                        צפיה בפניות
                    </button>

                    <button type="button" onClick={() => goToPage("cancellations")}>
                        ניהול ביטולים
                    </button>

                    <button type="button" onClick={() => goToPage("attendance")}>
                        בדיקת נוכחות
                    </button>

                    <button
                        type="button"
                        disabled
                        title={TEAMMATE_PAGE_TOOLTIP}
                    >
                        ניהול מתנדבים
                    </button>
                </div>
            )}

            {renderCurrentPage()}
        </div>
    );
}

export default StaffDashboard;
