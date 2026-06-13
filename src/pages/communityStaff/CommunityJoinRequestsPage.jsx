import { useState } from "react";
import CommunityJoinRequestsTable from "../../components/communityStaff/CommunityJoinRequestsTable.jsx";
import CompleteCommunityJoinModal from "../../components/communityStaff/CompleteCommunityJoinModal.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function CommunityJoinRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCompleteRegistration = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const handleSaved = () => {
    setSelectedRequest(null);
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="community-join-requests-page" dir="rtl">
      <header className="community-join-requests-page__header">
        <h1 className="community-join-requests-page__title">
          בקשות הצטרפות לקהילה תומכת
        </h1>
      </header>

      <CommunityJoinRequestsTable
        refreshKey={refreshKey}
        onCompleteRegistration={handleCompleteRegistration}
      />

      <CompleteCommunityJoinModal
        request={selectedRequest}
        onClose={handleCloseModal}
        onSaved={handleSaved}
      />
    </div>
  );
}

export default CommunityJoinRequestsPage;
