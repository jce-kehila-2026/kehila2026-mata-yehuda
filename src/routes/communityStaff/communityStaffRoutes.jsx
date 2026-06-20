import CommunityStaffDashboardPage from "../../pages/communityStaff/CommunityStaffDashboardPage";
import CommunityHelpRequestsPage from "../../pages/communityStaff/CommunityHelpRequestsPage";
import CommunityJoinRequestsPage from "../../pages/communityStaff/CommunityJoinRequestsPage";
import CommunityMembersPage from "../../pages/communityStaff/CommunityMembersPage";
import CommunitySettingsPage from "../../pages/communityStaff/CommunitySettingsPage";
import VolunteerRequestsPage from "../../pages/communityStaff/VolunteerRequestsPage";
import VolunteersManagementPage from "../../pages/communityStaff/VolunteersManagementPage";
import ActiveVolunteerMatchesPage from "../../pages/communityStaff/ActiveVolunteerMatchesPage";
import { withStaffAuthGate } from "../../components/staff/StaffAuthGate";

const communityStaffRoutes = [
  {
    path: "/community-staff",
    Component: withStaffAuthGate(CommunityStaffDashboardPage),
  },
  {
    path: "/community-staff/join-requests",
    Component: withStaffAuthGate(CommunityJoinRequestsPage),
  },
  {
    path: "/community-staff/members",
    Component: withStaffAuthGate(CommunityMembersPage),
  },
  {
    path: "/community-staff/volunteer-requests",
    Component: withStaffAuthGate(VolunteerRequestsPage),
  },
  {
    path: "/community-staff/volunteers",
    Component: withStaffAuthGate(VolunteersManagementPage),
  },
  {
    path: "/community-staff/help-requests",
    Component: withStaffAuthGate(CommunityHelpRequestsPage),
  },
  {
    path: "/community-staff/active-matches",
    Component: withStaffAuthGate(ActiveVolunteerMatchesPage),
  },
  {
    path: "/community-staff/settings",
    Component: withStaffAuthGate(CommunitySettingsPage),
  },
];

export default communityStaffRoutes;
