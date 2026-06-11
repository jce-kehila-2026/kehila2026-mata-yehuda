import CommunityJoinRequestsTable from "../../components/communityStaff/CommunityJoinRequestsTable";
import "../styles/CommunityStaffDashboard.css";

function CommunityJoinRequestsPage() {
  const handleCompleteRegistration = (request) => {
    console.log("Complete registration for:", request);
    alert("בהמשך ייפתח טופס השלמת רישום");
  };

  return (
    <div className="community-join-requests-page" dir="rtl">
      <header className="community-join-requests-page__header">
        <h1 className="community-join-requests-page__title">
          בקשות הצטרפות לקהילה תומכת
        </h1>
      </header>

      <CommunityJoinRequestsTable
        onCompleteRegistration={handleCompleteRegistration}
      />
    </div>
  );
}

export default CommunityJoinRequestsPage;