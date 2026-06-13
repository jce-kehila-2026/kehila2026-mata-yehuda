import { useState } from "react";
import VolunteersManagementTable from "../../components/communityStaff/VolunteersManagementTable.jsx";
import EditVolunteerModal from "../../components/communityStaff/EditVolunteerModal.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function VolunteersManagementPage() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleVolunteerUpdated = () => {
    setSelectedVolunteer(null);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="community-volunteers-mgmt-page" dir="rtl">
      <header className="community-volunteers-mgmt-page__header">
        <h1 className="community-volunteers-mgmt-page__title">מתנדבים</h1>
      </header>

      <VolunteersManagementTable
        refreshKey={refreshKey}
        onEditVolunteer={setSelectedVolunteer}
        onVolunteerUpdated={() => setRefreshKey((current) => current + 1)}
      />

      <EditVolunteerModal
        volunteer={selectedVolunteer}
        onClose={() => setSelectedVolunteer(null)}
        onSaved={handleVolunteerUpdated}
      />
    </div>
  );
}

export default VolunteersManagementPage;
