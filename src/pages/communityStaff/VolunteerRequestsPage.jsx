import VolunteerRequestsTable from "../../components/communityStaff/VolunteerRequestsTable.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function VolunteerRequestsPage() {
  return (
    <div className="community-volunteer-requests-page" dir="rtl">
      <header className="community-volunteer-requests-page__header">
        <h1 className="community-volunteer-requests-page__title page-title">
          בקשות התנדבות
        </h1>
      </header>

      <VolunteerRequestsTable />
    </div>
  );
}

export default VolunteerRequestsPage;
