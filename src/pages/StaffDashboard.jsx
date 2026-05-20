import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import ManageActivities from "./ManageActivities";

function StaffDashboard({ onLogout }) {
    const [currentPage, setCurrentPage] = useState("dashboard");
    async function handleLogout() {
        await signOut(auth);
        onLogout();
        console.log("logout clicked");
    }
    return (
        <div>
            <h1>Welcome Staff</h1>
            <button onClick={handleLogout}>
                Logout
            </button>
            {currentPage === "dashboard" && (
                <div className="dashboard-buttons">

                    <button onClick={() => setCurrentPage("activities")}>
                        Manage Activities
                    </button>

                    <button onClick={() => setCurrentPage("addStaff")}>
                        Add Staff Member
                    </button>

                    <button onClick={() => setCurrentPage("notifications")}>
                        Send Notification
                    </button>

                    <button onClick={() => setCurrentPage("statistics")}>
                        View Statistics
                    </button>

                    <button onClick={() => setCurrentPage("filterData")}>
                        Filter The Data
                    </button>

                    <button onClick={() => setCurrentPage("calendar")}>
                        Update Monthly Calendar
                    </button>

                    <button onClick={() => setCurrentPage("requests")}>
                        View Requests
                    </button>

                    <button onClick={() => setCurrentPage("cancelledRegistrations")}>
                        Manage Cancelled Registration
                    </button>

                    <button onClick={() => setCurrentPage("activityRegistrations")}>
                        Manage Activity Registration
                    </button>

                    <button onClick={() => setCurrentPage("attendance")}>
                        Check Attendance
                    </button>

                </div>
            )}
            {currentPage === "activities" && (
                <div>
                    <button onClick={() => setCurrentPage("dashboard")}>
                        Back to Dashboard
                    </button>

                    <ManageActivities />
                </div>
            )}
        </div>
    )
}
export default StaffDashboard;

