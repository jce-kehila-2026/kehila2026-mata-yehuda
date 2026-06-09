import CommunityStaffDashboardPage from "../pages/CommunityStaffDashboardPage";
import CommunityHelpRequestsPage from "../pages/CommunityHelpRequestsPage";
import CommunityJoinRequestsPage from "../pages/CommunityJoinRequestsPage";
import VolunteerRequestsPage from "../pages/VolunteerRequestsPage";

const communityStaffRoutes = [
  {
    path: "/",
    element: <CommunityStaffDashboardPage />,
  },
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