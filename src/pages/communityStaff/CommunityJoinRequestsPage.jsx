import { useState } from "react";
import CommunityJoinRequestsTable from "../../components/communityStaff/CommunityJoinRequestsTable.jsx";
import CompleteCommunityJoinModal from "../../components/communityStaff/CompleteCommunityJoinModal.jsx";
import CommunityJoinRequestDetailsModal from "../../components/communityStaff/CommunityJoinRequestDetailsModal.jsx";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "../../components/communityStaff/CommunityStaffMessage.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function CommunityJoinRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { message, showSuccess, clearMessage } = useCommunityStaffMessage();

  const handleCompleteRegistration = (request) => {
    setDetailsRequest(null);
    setSelectedRequest(request);
  };

  const handleSaved = () => {
    setSelectedRequest(null);
    showSuccess("הרישום הושלם בהצלחה");
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="community-join-requests-page" dir="rtl">
      <header className="community-join-requests-page__header">
        <h1 className="community-join-requests-page__title page-title">
          בקשות הצטרפות לקהילה תומכת
        </h1>
      </header>

      <CommunityStaffMessage message={message} onDismiss={clearMessage} />

      <CommunityJoinRequestsTable
        refreshKey={refreshKey}
        onCompleteRegistration={handleCompleteRegistration}
        onViewDetails={setDetailsRequest}
      />

      <CommunityJoinRequestDetailsModal
        request={detailsRequest}
        onClose={() => setDetailsRequest(null)}
        onCompleteRegistration={handleCompleteRegistration}
      />

      <CompleteCommunityJoinModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}

export default CommunityJoinRequestsPage;
