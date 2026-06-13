import CommunityStaffDashboardPage from "../../pages/communityStaff/CommunityStaffDashboardPage";
import CommunityHelpRequestsPage from "../../pages/communityStaff/CommunityHelpRequestsPage";
import CommunityJoinRequestsPage from "../../pages/communityStaff/CommunityJoinRequestsPage";
import CommunityMembersPage from "../../pages/communityStaff/CommunityMembersPage";
import VolunteerRequestsPage from "../../pages/communityStaff/VolunteerRequestsPage";
import VolunteersManagementPage from "../../pages/communityStaff/VolunteersManagementPage";

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
    path: "/community-staff/members",
    element: <CommunityMembersPage />,
  },
  {
    path: "/community-staff/volunteer-requests",
    element: <VolunteerRequestsPage />,
  },
  {
    path: "/community-staff/volunteers",
    element: <VolunteersManagementPage />,
  },
  {
    path: "/community-staff/help-requests",
    element: <CommunityHelpRequestsPage />,
  },
];

export default communityStaffRoutes;
