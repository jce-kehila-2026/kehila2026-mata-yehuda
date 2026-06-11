// routes/supportiveCommunityRoutes.jsx

import SupportiveCommunityPage from "../../pages/supportive community/SupportiveCommunityPage";
import CommunityJoinPage from "../../pages/supportive community/CommunityJoinPage";
import ServiceRequestPage from "../../pages/supportive community/ServiceRequestPage";
import VolunteerRegistrationPage from "../../pages/supportive community/VolunteerRegistrationPage";

const supportiveCommunityRoutes = [
  {
     path: "/",
    element: <SupportiveCommunityPage />,
  },
  {
    path: "/supportive-community",
    element: <SupportiveCommunityPage />,
  },
  {
    path: "/community-join",
    element: <CommunityJoinPage />,
  },
  {
    path: "/community-service-request",
    element: <ServiceRequestPage />,
  },
  {
    path: "/community-volunteer",
    element: <VolunteerRegistrationPage />,
  },
];

export default supportiveCommunityRoutes;