import "../../styles/attendance/AttendancePage.css";

function AttendancePage({ onNavigate }) {
  return (
    <div className="attendance-page" dir="rtl">
      <header className="attendance-page__header">
        <h1 className="attendance-page__title">נוכחות</h1>
      </header>

      <div className="attendance-page__content">
        <div className="attendance-page__cards">
          <button
            type="button"
            className="attendance-page__card-link"
            onClick={() => onNavigate("take")}
          >
            <h2 className="attendance-page__card-title">לקיחת נוכחות</h2>
            <p className="attendance-page__card-text">
              חיפוש פעילות, סימון נוכחות ושמירת רשומות חדשות.
            </p>
          </button>

          <button
            type="button"
            className="attendance-page__card-link"
            onClick={() => onNavigate("records")}
          >
            <h2 className="attendance-page__card-title">צפייה בנוכחות</h2>
            <p className="attendance-page__card-text">
              צפייה ברשומות נוכחות שנשמרו לפי פעילות ותאריך.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendancePage;
