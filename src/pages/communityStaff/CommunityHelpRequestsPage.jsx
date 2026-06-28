import { useNavigate } from "react-router-dom";
import CommunityHelpRequestsTable from "../../components/communityStaff/CommunityHelpRequestsTable.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function CommunityHelpRequestsPage() {
  const navigate = useNavigate();

  return (
    <div
      className="community-help-requests-page activities-mgmt-page"
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
              בקשות סיוע והתאמות
            </h1>
            <p className="activities-mgmt-page__subtitle">
              ניהול בקשות סיוע והתאמת מתנדבים מתאימים
            </p>
          </div>
          <div className="activities-mgmt-page__actions">
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

        <CommunityHelpRequestsTable />
      </div>
    </div>
  );
}

export default CommunityHelpRequestsPage;
