import { useState } from "react";
import CommunityMembersTable from "../../components/communityStaff/CommunityMembersTable.jsx";
import EditCommunityMemberModal from "../../components/communityStaff/EditCommunityMemberModal.jsx";
import CommunityMemberRequestsHistoryModal from "../../components/communityStaff/CommunityMemberRequestsHistoryModal.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function CommunityMembersPage() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [historyMember, setHistoryMember] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditMember = (member) => {
    setSelectedMember(member);
  };

  const handleViewHistory = (member) => {
    setHistoryMember(member);
  };

  const handleMemberUpdated = () => {
    setSelectedMember(null);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="community-members-page" dir="rtl">
      <header className="community-members-page__header">
        <h1 className="community-members-page__title">חברי קהילה</h1>
      </header>

      <CommunityMembersTable
        refreshKey={refreshKey}
        onEditMember={handleEditMember}
        onViewHistory={handleViewHistory}
        onMemberUpdated={() => setRefreshKey((current) => current + 1)}
      />

      <EditCommunityMemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onSaved={handleMemberUpdated}
      />

      <CommunityMemberRequestsHistoryModal
        member={historyMember}
        onClose={() => setHistoryMember(null)}
      />
    </div>
  );
}

export default CommunityMembersPage;
