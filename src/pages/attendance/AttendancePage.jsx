import { useState } from "react";
import { ClipboardCheck, ScrollText } from "lucide-react";
import TakeAttendancePage from "./TakeAttendancePage";
import AttendanceRecordsPage from "./AttendanceRecordsPage";
import "../../styles/attendance/AttendancePage.css";

function AttendancePage({ onBackToDashboard }) {
  const [currentPage, setCurrentPage] = useState("menu");

  if (currentPage === "take") {
    return <TakeAttendancePage onBack={() => setCurrentPage("menu")} />;
  }

  if (currentPage === "records") {
    return <AttendanceRecordsPage onBack={() => setCurrentPage("menu")} />;
  }

  return (
    <div className="attendance-page list-mgmt-page" dir="rtl">
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--top"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--left"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--bottom"
      />

      <div className="staff-container">
        <header className="list-mgmt-page__header">
          <div className="list-mgmt-page__header-main">
            <h1 className="list-mgmt-page__title">נוכחות</h1>
            <p className="list-mgmt-page__subtitle">
              ניהול לקיחת נוכחות וצפייה ברשומות
            </p>
          </div>
          {onBackToDashboard ? (
            <div className="list-mgmt-page__actions">
              <button
                type="button"
                className="staff-back-button"
                onClick={onBackToDashboard}
              >
                <span className="staff-back-button__icon" aria-hidden="true">
                  →
                </span>
                חזרה ללוח הבקרה
              </button>
            </div>
          ) : null}
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
              <span className="attendance-page__card-title">בדיקת נוכחות</span>
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
