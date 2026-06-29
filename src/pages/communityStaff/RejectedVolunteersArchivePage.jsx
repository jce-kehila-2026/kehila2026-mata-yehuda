import { useNavigate } from "react-router-dom";
import RejectedVolunteersArchiveTable from "../../components/communityStaff/RejectedVolunteersArchiveTable.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function RejectedVolunteersArchivePage() {
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
              ארכיון בקשות התנדבות שנדחו
            </h1>
            <p className="activities-mgmt-page__subtitle">
              בקשות מתנדבים שנדחו. ניתן לשחזר בקשה לרשימת הממתינות או למחוק לצמיתות.
            </p>
          </div>
          <div className="activities-mgmt-page__actions">
            <button
              type="button"
              className="staff-back-button"
              onClick={() => navigate("/community-staff/volunteer-requests")}
            >
              <span className="staff-back-button__icon" aria-hidden="true">
                →
              </span>
              חזרה לבקשות ההתנדבות
            </button>
          </div>
        </header>

        <RejectedVolunteersArchiveTable />
      </div>
    </div>
  );
}

export default RejectedVolunteersArchivePage;
