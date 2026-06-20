import { useState } from "react";
import { ClipboardCheck, ScrollText } from "lucide-react";
import TakeAttendancePage from "./TakeAttendancePage";
import AttendanceRecordsPage from "./AttendanceRecordsPage";
import "../../styles/attendance/AttendancePage.css";

function AttendancePage() {
  const [currentPage, setCurrentPage] = useState("menu");

  if (currentPage === "take") {
    return <TakeAttendancePage onBack={() => setCurrentPage("menu")} />;
  }

  if (currentPage === "records") {
    return <AttendanceRecordsPage onBack={() => setCurrentPage("menu")} />;
  }

  return (
    <div className="attendance-page" dir="rtl">
      <div className="attendance-page__container">
        <header className="attendance-page__header">
          <h1 className="attendance-page__title">נוכחות</h1>
          <p className="attendance-page__subtitle">
            ניהול לקיחת נוכחות וצפייה ברשומות
          </p>
        </header>

        <div className="attendance-page__cards" role="list">
          <button
            type="button"
            className="attendance-page__card attendance-page__card--take"
            onClick={() => setCurrentPage("take")}
            role="listitem"
          >
            <span className="attendance-page__card-icon" aria-hidden="true">
              <ClipboardCheck strokeWidth={1.85} />
            </span>
            <span className="attendance-page__card-body">
              <span className="attendance-page__card-title">לקיחת נוכחות</span>
              <span className="attendance-page__card-text">
                חיפוש פעילות, סימון נוכחות ושמירת רשומות חדשות.
              </span>
            </span>
          </button>

          <button
            type="button"
            className="attendance-page__card attendance-page__card--records"
            onClick={() => setCurrentPage("records")}
            role="listitem"
          >
            <span className="attendance-page__card-icon" aria-hidden="true">
              <ScrollText strokeWidth={1.85} />
            </span>
            <span className="attendance-page__card-body">
              <span className="attendance-page__card-title">צפייה בנוכחות</span>
              <span className="attendance-page__card-text">
                צפייה ברשומות נוכחות שנשמרו לפי פעילות ותאריך.
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendancePage;
