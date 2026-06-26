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
    <div
      className="community-join-requests-page activities-mgmt-page"
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
            <h1 className="activities-mgmt-page__title">
              בקשות הצטרפות לקהילה תומכת
            </h1>
            <p className="activities-mgmt-page__subtitle">
              ניהול ואישור בקשות הצטרפות חדשות לקהילה התומכת
            </p>
          </div>
        </header>

        <CommunityStaffMessage message={message} onDismiss={clearMessage} />

        <CommunityJoinRequestsTable
          refreshKey={refreshKey}
          onCompleteRegistration={handleCompleteRegistration}
          onViewDetails={setDetailsRequest}
        />
      </div>

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
