import { useState } from "react";
import CommunityMembersTable from "../../components/communityStaff/CommunityMembersTable.jsx";
import EditCommunityMemberModal from "../../components/communityStaff/EditCommunityMemberModal.jsx";
import CommunityMemberDetailsModal from "../../components/communityStaff/CommunityMemberDetailsModal.jsx";
import CommunityMemberRequestsHistoryModal from "../../components/communityStaff/CommunityMemberRequestsHistoryModal.jsx";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "../../components/communityStaff/CommunityStaffMessage.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function CommunityMembersPage() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailsMember, setDetailsMember] = useState(null);
  const [historyMember, setHistoryMember] = useState(null);
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
    <div className="community-members-page" dir="rtl">
      <header className="community-members-page__header">
        <h1 className="community-members-page__title page-title">חברי קהילה</h1>
      </header>

      <CommunityStaffMessage message={message} onDismiss={clearMessage} />

      <CommunityMembersTable
        refreshKey={refreshKey}
        onEditMember={setSelectedMember}
        onViewDetails={setDetailsMember}
        onMemberUpdated={handleMemberUpdated}
        onShowError={showError}
      />

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
    </div>
  );
}

export default CommunityMembersPage;
