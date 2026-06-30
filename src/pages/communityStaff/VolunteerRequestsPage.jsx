import { useNavigate } from "react-router-dom";
import { Archive } from "lucide-react";
import VolunteerRequestsTable from "../../components/communityStaff/VolunteerRequestsTable.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function VolunteerRequestsPage() {
  const navigate = useNavigate();

  return (
    <div
      className="community-volunteer-requests-page activities-mgmt-page"
      dir="rtl"
    >
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="activities-mgmt-decoration activities-mgmt-decoration--top"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="activities-mgmt-decoration activities-mgmt-decoration--left"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="activities-mgmt-decoration activities-mgmt-decoration--bottom"
      />

      <div className="staff-container staff-container--activities">
        <header className="activities-mgmt-page__header">
          <div className="activities-mgmt-page__header-main">
            <h1 className="activities-mgmt-page__title">
              בקשות התנדבות לקהילה תומכת
            </h1>
            <p className="activities-mgmt-page__subtitle">
              ניהול ואישור בקשות מתנדבים חדשות לקהילה התומכת
            </p>
          </div>
          <div className="activities-mgmt-page__actions">
            <button
              type="button"
              className="activities-mgmt-page__action activities-mgmt-page__action--archive"
              onClick={() =>
                navigate("/community-staff/volunteer-requests/archive")
              }
            >
              <Archive
                className="activities-mgmt-page__action-icon"
                strokeWidth={2.25}
                aria-hidden="true"
              />
              <span>צפייה בארכיון</span>
            </button>
            <button
              type="button"
              className="staff-back-button"
              onClick={() => navigate("/community-staff")}
            >
              <span className="staff-back-button__icon" aria-hidden="true">
                →
              </span>
              חזרה ללוח הבקרה
            </button>
          </div>
        </header>

        <VolunteerRequestsTable />
      </div>
    </div>
  );
}

export default VolunteerRequestsPage;
