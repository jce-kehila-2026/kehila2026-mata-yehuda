import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegistrationLayout from "../components/RegistrationLayout";
import PaymentPage from "../pages/PaymentPage";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentCancel from "../pages/PaymentCancel";
import StaffCancellations from "../pages/StaffCancellations";

function PaymentRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RegistrationLayout>
              <PaymentPage />
            </RegistrationLayout>
          }
        />
        <Route
          path="/pay"
          element={
            <RegistrationLayout>
              <PaymentPage />
            </RegistrationLayout>
          }
        />

        <Route path="/staff" element={<StaffCancellations />} />

        <Route
          path="/payment-success"
          element={
            <RegistrationLayout>
              <PaymentSuccess />
            </RegistrationLayout>
          }
        />

        <Route
          path="/payment-cancel"
          element={
            <RegistrationLayout>
              <PaymentCancel />
            </RegistrationLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default PaymentRoutes;
