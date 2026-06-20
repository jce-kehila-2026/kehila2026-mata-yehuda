import { useState } from "react";
import ActiveVolunteerMatchesTable from "../../components/communityStaff/ActiveVolunteerMatchesTable.jsx";
import ActiveVolunteerMatchDetailsModal from "../../components/communityStaff/ActiveVolunteerMatchDetailsModal.jsx";
import ActiveVolunteerMatchSummaryModal from "../../components/communityStaff/ActiveVolunteerMatchSummaryModal.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function ActiveVolunteerMatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailsMatch, setDetailsMatch] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMatchUpdated = () => {
    setSelectedMatch(null);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="community-active-matches-page" dir="rtl">
      <header className="community-active-matches-page__header">
        <h1 className="community-active-matches-page__title page-title">התאמות פעילות</h1>
        <p className="community-staff-page-subtitle">
          ניהול והצגת התאמות פעילות בין משתתפים למתנדבים
        </p>
      </header>

      <ActiveVolunteerMatchesTable
        refreshKey={refreshKey}
        onManageMatch={setSelectedMatch}
        onViewDetails={setDetailsMatch}
      />

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
