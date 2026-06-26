import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import CommunityMembersTable from "../../components/communityStaff/CommunityMembersTable.jsx";
import CreateCommunityMemberModal from "../../components/communityStaff/CreateCommunityMemberModal.jsx";
import EditCommunityMemberModal from "../../components/communityStaff/EditCommunityMemberModal.jsx";
import CommunityMemberDetailsModal from "../../components/communityStaff/CommunityMemberDetailsModal.jsx";
import CommunityMemberRequestsHistoryModal from "../../components/communityStaff/CommunityMemberRequestsHistoryModal.jsx";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "../../components/communityStaff/CommunityStaffMessage.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function CommunityMembersPage() {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);
  const [historyMember, setHistoryMember] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { message, showSuccess, showError, clearMessage } =
    useCommunityStaffMessage();

  const handleMemberUpdated = (result) => {
    if (result?.successMessage) {
      showSuccess(result.successMessage);
    }

    setSelectedMember(null);
    setDetailsMember(null);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div
      className="community-members-page activities-mgmt-page"
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
            <h1 className="activities-mgmt-page__title">חברי קהילה</h1>
            <p className="activities-mgmt-page__subtitle">
              ניהול חברי קהילה פעילים ולא פעילים
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
              <span>הוספת חבר קהילה</span>
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

        <CommunityMembersTable
          refreshKey={refreshKey}
          onEditMember={setSelectedMember}
          onViewDetails={setDetailsMember}
          onMemberUpdated={handleMemberUpdated}
          onShowError={showError}
        />
      </div>

      <EditCommunityMemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onSaved={() => {
          showSuccess("החבר עודכן בהצלחה");
          handleMemberUpdated();
        }}
      />

      <CommunityMemberDetailsModal
        member={detailsMember}
        onClose={() => setDetailsMember(null)}
        onEdit={(member) => {
          setDetailsMember(null);
          setSelectedMember(member);
        }}
        onViewHistory={(member) => {
          setDetailsMember(null);
          setHistoryMember(member);
        }}
        onMemberUpdated={handleMemberUpdated}
        onShowError={showError}
      />

      <CommunityMemberRequestsHistoryModal
        member={historyMember}
        onClose={() => setHistoryMember(null)}
      />

      <CreateCommunityMemberModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSaved={() => {
          setShowCreateModal(false);
          showSuccess("חבר/ת הקהילה נוצר/ה בהצלחה");
          setRefreshKey((current) => current + 1);
        }}
      />
    </div>
  );
}

export default CommunityMembersPage;
