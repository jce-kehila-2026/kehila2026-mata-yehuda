import RegistrationLayout from "../../components/Payment/RegistrationLayout";
import DonationPage from "../pages/DonationPage";
import DonationSuccessPage from "../pages/DonationSuccessPage";
import DonationCancelPage from "../pages/DonationCancelPage";

const donationRoutes = [
  {
    path: "/donations",
    element: (
      <RegistrationLayout>
        <DonationPage />
      </RegistrationLayout>
    ),
  },
  {
    path: "/donations/success",
    element: (
      <RegistrationLayout>
        <DonationSuccessPage />
      </RegistrationLayout>
    ),
  },
  {
    path: "/donations/cancel",
    element: (
      <RegistrationLayout>
        <DonationCancelPage />
      </RegistrationLayout>
    ),
  },
];

export default donationRoutes;
