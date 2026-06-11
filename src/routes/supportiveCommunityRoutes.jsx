// routes/supportiveCommunityRoutes.jsx

import SupportiveCommunityPage from "../pages/SupportiveCommunityPage";
import CommunityJoinPage from "../pages/CommunityJoinPage";
import ServiceRequestPage from "../pages/ServiceRequestPage";
import VolunteerRegistrationPage from "../pages/VolunteerRegistrationPage";

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