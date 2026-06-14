import CommunityHelpRequestsTable from "../../components/communityStaff/CommunityHelpRequestsTable.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function CommunityHelpRequestsPage() {
  return (
    <div className="community-help-requests-page" dir="rtl">
      <header className="community-help-requests-page__header">
        <h1 className="community-help-requests-page__title page-title">
          בקשות סיוע והתאמות
        </h1>
      </header>

      <CommunityHelpRequestsTable />
    </div>
  );
}

export default CommunityHelpRequestsPage;
