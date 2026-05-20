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
            <h1>ברוך הבא צוות</h1>

            <button onClick={handleLogout}>
                התנתקות
            </button>

            {currentPage === "dashboard" && (
                <div className="dashboard-buttons">

                    <button onClick={() => setCurrentPage("activities")}>
                        ניהול פעילויות
                    </button>

                    <button onClick={() => setCurrentPage("addStaff")}>
                        הוספת איש צוות
                    </button>

                    <button onClick={() => setCurrentPage("notifications")}>
                        שליחת הודעות
                    </button>

                    <button onClick={() => setCurrentPage("statistics")}>
                        צפייה בסטטיסטיקות
                    </button>

                    <button onClick={() => setCurrentPage("filterData")}>
                        סינון נתונים
                    </button>

                    <button onClick={() => setCurrentPage("calendar")}>
                        עדכון לוח חודשי
                    </button>

                    <button onClick={() => setCurrentPage("requests")}>
                        צפייה בבקשות
                    </button>

                    <button onClick={() => setCurrentPage("cancelledRegistrations")}>
                        ניהול ביטולי הרשמה
                    </button>

                    <button onClick={() => setCurrentPage("activityRegistrations")}>
                        ניהול הרשמות לפעילויות
                    </button>

                    <button onClick={() => setCurrentPage("attendance")}>
                        בדיקת נוכחות
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
        </div>
    )
}
export default StaffDashboard;

