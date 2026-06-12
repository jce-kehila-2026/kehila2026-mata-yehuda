import RegistrationLayout from "../../components/Payment/RegistrationLayout";
import PaymentPage from "../../pages/Payment/PaymentPage";
import PaymentSuccess from "../../pages/Payment/PaymentSuccess";
import PaymentCancel from "../../pages/CancelTheRegistration/PaymentCancel";
import StaffCancellations from "../../pages/CancelTheRegistration/StaffCancellations";

const paymentRoutes = [
  {
    path: "/pay",
    element: (
      <RegistrationLayout>
        <PaymentPage />
      </RegistrationLayout>
    ),
  },
  {
    path: "/payment-success",
    element: (
      <RegistrationLayout>
        <PaymentSuccess />
      </RegistrationLayout>
    ),
  },
  {
    path: "/payment-cancel",
    element: (
      <RegistrationLayout>
        <PaymentCancel />
      </RegistrationLayout>
    ),
  },
  {
    path: "/staff",
    element: <StaffCancellations />,
  },
];

export default paymentRoutes;
