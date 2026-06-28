import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveVolunteerMatchesTable from "../../components/communityStaff/ActiveVolunteerMatchesTable.jsx";
import ActiveVolunteerMatchDetailsModal from "../../components/communityStaff/ActiveVolunteerMatchDetailsModal.jsx";
import ActiveVolunteerMatchSummaryModal from "../../components/communityStaff/ActiveVolunteerMatchSummaryModal.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function ActiveVolunteerMatchesPage() {
  const navigate = useNavigate();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailsMatch, setDetailsMatch] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMatchUpdated = () => {
    setSelectedMatch(null);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div
      className="community-active-matches-page activities-mgmt-page"
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
            <h1 className="activities-mgmt-page__title">התאמות פעילות</h1>
            <p className="activities-mgmt-page__subtitle">
              ניהול והצגת התאמות פעילות בין משתתפים למתנדבים
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

        <ActiveVolunteerMatchesTable
          refreshKey={refreshKey}
          onManageMatch={setSelectedMatch}
          onViewDetails={setDetailsMatch}
        />
      </div>

      <ActiveVolunteerMatchSummaryModal
        match={detailsMatch}
        onClose={() => setDetailsMatch(null)}
        onManage={(match) => {
          setDetailsMatch(null);
          setSelectedMatch(match);
        }}
      />

      <ActiveVolunteerMatchDetailsModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onSaved={handleMatchUpdated}
      />
    </div>
  );
}

export default ActiveVolunteerMatchesPage;
