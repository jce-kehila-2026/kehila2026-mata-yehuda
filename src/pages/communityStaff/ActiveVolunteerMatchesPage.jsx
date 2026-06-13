import { useState } from "react";
import ActiveVolunteerMatchesTable from "../../components/communityStaff/ActiveVolunteerMatchesTable.jsx";
import ActiveVolunteerMatchDetailsModal from "../../components/communityStaff/ActiveVolunteerMatchDetailsModal.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function ActiveVolunteerMatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMatchUpdated = () => {
    setSelectedMatch(null);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="community-active-matches-page" dir="rtl">
      <header className="community-active-matches-page__header">
        <h1 className="community-active-matches-page__title">התאמות פעילות</h1>
      </header>

      <ActiveVolunteerMatchesTable
        refreshKey={refreshKey}
        onViewMatch={setSelectedMatch}
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
