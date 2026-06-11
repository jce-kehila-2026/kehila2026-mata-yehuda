import CommunityStaffDashboardPage from "../../pages/communityStaff/CommunityStaffDashboardPage";
import CommunityHelpRequestsPage from "../../pages/communityStaff/CommunityHelpRequestsPage";
import CommunityJoinRequestsPage from "../../pages/communityStaff/CommunityJoinRequestsPage";
import VolunteerRequestsPage from "../../pages/communityStaff/VolunteerRequestsPage";

const communityStaffRoutes = [
  {
    path: "/community-staff",
    element: <CommunityStaffDashboardPage />,
  },
  {
    path: "/community-staff/join-requests",
    element: <CommunityJoinRequestsPage />,
  },
  {
    path: "/community-staff/volunteer-requests",
    element: <VolunteerRequestsPage />,
  },
  {
    path: "/community-staff/help-requests",
    element: <CommunityHelpRequestsPage />,
  },
];

export default communityStaffRoutes;
