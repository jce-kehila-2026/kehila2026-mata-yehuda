import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import ManageActivities from "./ManageActivities";
import ManageStaff from "./ManageStaff";
import ManagePrograms from "./ManagePrograms";
import ManageParticipants from "./ManageParticipants";

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

                    <button onClick={() => setCurrentPage("programs")}>
                        ניהול תוכניות
                    </button>

                    <button onClick={() => setCurrentPage("manageStaff")}>
                        ניהול אנשי צוות
                    </button>

                    <button onClick={() => setCurrentPage("manageParticipants")}>
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

            {currentPage === "programs" && (
                <div>
                    <button onClick={() => setCurrentPage("dashboard")}>
                        חזרה ללוח הבקרה
                    </button>

                    <ManagePrograms />
                </div>
            )}

            {currentPage === "manageParticipants" && (
                <div>
                    <button onClick={() => setCurrentPage("dashboard")}>
                        חזרה ללוח הבקרה
                    </button>

                    <ManageParticipants />
                </div>
            )}
        </div>
    )
}
export default StaffDashboard;

