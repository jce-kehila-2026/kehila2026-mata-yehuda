import { useState } from "react";
import VolunteersManagementTable from "../../components/communityStaff/VolunteersManagementTable.jsx";
import EditVolunteerModal from "../../components/communityStaff/EditVolunteerModal.jsx";
import VolunteerManagementDetailsModal from "../../components/communityStaff/VolunteerManagementDetailsModal.jsx";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "../../components/communityStaff/CommunityStaffMessage.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function VolunteersManagementPage() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [detailsVolunteer, setDetailsVolunteer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { message, showSuccess, showError, clearMessage } =
    useCommunityStaffMessage();

  const handleVolunteerUpdated = (result) => {
    if (result?.successMessage) {
      showSuccess(result.successMessage);
    }

    setSelectedVolunteer(null);
    setDetailsVolunteer(null);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="community-volunteers-mgmt-page" dir="rtl">
      <header className="community-volunteers-mgmt-page__header">
        <h1 className="community-volunteers-mgmt-page__title">מתנדבים</h1>
      </header>

      <CommunityStaffMessage message={message} onDismiss={clearMessage} />

      <VolunteersManagementTable
        refreshKey={refreshKey}
        onEditVolunteer={setSelectedVolunteer}
        onViewDetails={setDetailsVolunteer}
      />

      <VolunteerManagementDetailsModal
        volunteer={detailsVolunteer}
        onClose={() => setDetailsVolunteer(null)}
        onEdit={(volunteer) => {
          setDetailsVolunteer(null);
          setSelectedVolunteer(volunteer);
        }}
        onVolunteerUpdated={handleVolunteerUpdated}
        onShowError={showError}
      />

      <EditVolunteerModal
        volunteer={selectedVolunteer}
        onClose={() => setSelectedVolunteer(null)}
        onSaved={() => {
          showSuccess("פרטי המתנדב עודכנו בהצלחה");
          handleVolunteerUpdated();
        }}
      />
    </div>
  );
}

export default VolunteersManagementPage;
