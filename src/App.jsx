import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicNotificationRegistration from "./components/notifications/PublicNotificationRegistration";

import AttendancePage from "./pages/attendance/AttendancePage";

import Home from "./pages/HomePages/Home.jsx";
import Plus60Page from "./pages/HomePages/Plus60Page.jsx";
import AboutPage from "./pages/HomePages/AboutPage.jsx";
import ServicesPage from "./pages/HomePages/ServicesPage.jsx";
import StaffLogin from "./pages/staffManegmentPages/StaffLogin";
import StaffStatisticsRoute from "./pages/staffManegmentPages/StaffStatisticsRoute";
import RegistrationLayout from "./components/Payment/RegistrationLayout";
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentCancel from "./pages/CancelTheRegistration/PaymentCancel";
import RequestsPage from "./pages/RespOneonRequest/RequestsPage";

import supportiveCommunityRoutes from "./routes/supportive community/supportiveCommunityRoutes";
import communityStaffRoutes from "./routes/communityStaff/communityStaffRoutes";
import donationRoutes from "./donations/routes/donationRoutes";

function App() {
  return (
    <BrowserRouter>
      <PublicNotificationRegistration />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plus60" element={<Plus60Page />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff/statistics" element={<StaffStatisticsRoute />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route
          path="/pay"
          element={
            <RegistrationLayout>
              <PaymentPage />
            </RegistrationLayout>
          }
        />
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

        <Route path="/attendance" element={<AttendancePage />} />

        {supportiveCommunityRoutes.map((route) => (
          <Route
            key={`sc-${route.path}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {communityStaffRoutes.map((route) => (
          <Route
            key={`cs-${route.path}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {donationRoutes.map((route) => (
          <Route
            key={`donation-${route.path}`}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
