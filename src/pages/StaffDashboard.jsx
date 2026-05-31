import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import ManageActivities from "./ManageActivities";
import ManageStaff from "./ManageStaff";

function StaffDashboard({ onLogout }) {
    const [currentPage, setCurrentPage] = useState("dashboard");
    async function handleLogout() {
        await signOut(auth);
        onLogout();
        console.log("logout clicked");
    }
    return (
        <div>
            <h1>ברוך הבא צוות</h1>
            <button onClick={handleLogout}>
                התנתקות
            </button>

            {currentPage === "dashboard" && (
                <div className="dashboard-buttons">

                    <button onClick={() => setCurrentPage("activities")}>
                        ניהול פעילויות חד פעמיות
                    </button>

                    <button onClick={() => setCurrentPage("calendar")}>
                        ניהול מרכז יום
                    </button>

                    <button onClick={() => setCurrentPage("calendar")}>
                        הוספת תוכנית חדשה
                    </button>

                    <button onClick={() => setCurrentPage("manageStaff")}>
                        ניהול אנשי צוות
                    </button>

                    <button onClick={() => setCurrentPage("manageStaff")}>
                        ניהול משתתפים
                    </button>

                    <button onClick={() => setCurrentPage("notifications")}>
                        שליחת הודעות
                    </button>

                    <button onClick={() => setCurrentPage("statistics")}>
                        צפייה בסטטיסטיקות
                    </button>

                    <button onClick={() => setCurrentPage("requests")}>
                        צפייה בבקשות
                    </button>

                    <button onClick={() => setCurrentPage("manageStaff")}>
                        צפיה בפניות
                    </button>

                    <button onClick={() => setCurrentPage("manageStaff")}>
                        ניהול ביטולים
                    </button>

                    <button onClick={() => setCurrentPage("attendance")}>
                        בדיקת נוכחות
                    </button>

                    <button onClick={() => setCurrentPage("manageStaff")}>
                        ניהול מתנדבים
                    </button>

                </div>
            )}
            {currentPage === "activities" && (
                <div>
                    <button onClick={() => setCurrentPage("dashboard")}>
                        חזרה ללוח הבקרה
                    </button>

                    <ManageActivities />
                </div>
            )}

            {currentPage === "manageStaff" && (
                <div>
                    <button onClick={() => setCurrentPage("dashboard")}>
                        חזרה ללוח הבקרה
                    </button>

                    <ManageStaff />
                </div>
            )}
        </div>
    )
}
export default StaffDashboard;

