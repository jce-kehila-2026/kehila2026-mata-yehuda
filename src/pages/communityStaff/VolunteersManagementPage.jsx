import { useState } from "react";
import CreateVolunteerModal from "../../components/communityStaff/CreateVolunteerModal.jsx";
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
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      <header className="community-volunteers-mgmt-page__header community-staff-page-header">
        <div className="community-staff-page-header__main">
          <h1 className="community-volunteers-mgmt-page__title page-title">מתנדבים</h1>
          <p className="community-staff-page-subtitle">
            ניהול מתנדבים פעילים ולא פעילים
          </p>
        </div>
        <button
          type="button"
          className="community-staff-page-header__action"
          onClick={() => setShowCreateModal(true)}
        >
          הוספת מתנדב
        </button>
      </header>

      <CommunityStaffMessage message={message} onDismiss={clearMessage} />

      <VolunteersManagementTable
        refreshKey={refreshKey}
        onEditVolunteer={setSelectedVolunteer}
        onViewDetails={setDetailsVolunteer}
        onVolunteerUpdated={handleVolunteerUpdated}
        onShowError={showError}
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

      <CreateVolunteerModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSaved={() => {
          setShowCreateModal(false);
          showSuccess("המתנדב/ה נוצר/ה בהצלחה");
          setRefreshKey((current) => current + 1);
        }}
      />
    </div>
  );
}

export default VolunteersManagementPage;
