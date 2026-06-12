import VolunteerRequestsTable from "../../components/communityStaff/VolunteerRequestsTable.jsx";
import "../../styles/CommunityStaff/communityStaffDashboard.css";

function VolunteerRequestsPage() {
  return (
    <div className="community-volunteer-requests-page" dir="rtl">
      <header className="community-volunteer-requests-page__header">
        <h1 className="community-volunteer-requests-page__title">
          בקשות התנדבות
        </h1>
      </header>

      <VolunteerRequestsTable />
    </div>
  );
}

export default VolunteerRequestsPage;
