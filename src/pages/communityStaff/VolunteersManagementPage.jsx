import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import CreateVolunteerModal from "../../components/communityStaff/CreateVolunteerModal.jsx";
import VolunteersManagementTable from "../../components/communityStaff/VolunteersManagementTable.jsx";
import EditVolunteerModal from "../../components/communityStaff/EditVolunteerModal.jsx";
import VolunteerManagementDetailsModal from "../../components/communityStaff/VolunteerManagementDetailsModal.jsx";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "../../components/communityStaff/CommunityStaffMessage.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function VolunteersManagementPage() {
  const navigate = useNavigate();
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
    <div
      className="community-volunteers-mgmt-page activities-mgmt-page"
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
            <h1 className="activities-mgmt-page__title">מתנדבים</h1>
            <p className="activities-mgmt-page__subtitle">
              ניהול מתנדבים פעילים ולא פעילים
            </p>
          </div>
          <div className="activities-mgmt-page__actions">
            <button
              type="button"
              className="activities-mgmt-page__action"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus
                className="activities-mgmt-page__action-icon"
                strokeWidth={2.25}
                aria-hidden="true"
              />
              <span>הוספת מתנדב</span>
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

        <CommunityStaffMessage message={message} onDismiss={clearMessage} />

        <VolunteersManagementTable
          refreshKey={refreshKey}
          onEditVolunteer={setSelectedVolunteer}
          onViewDetails={setDetailsVolunteer}
          onVolunteerUpdated={handleVolunteerUpdated}
          onShowError={showError}
        />
      </div>

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
