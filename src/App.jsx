import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AttendancePage from "./pages/attendance/AttendancePage";
import TakeAttendancePage from "./pages/attendance/TakeAttendancePage";
import AttendanceRecordsPage from "./pages/attendance/AttendanceRecordsPage";

import Home from "./pages/HomePages/Home.jsx";
import Plus60Page from "./pages/HomePages/Plus60Page.jsx";
import AboutPage from "./pages/HomePages/AboutPage.jsx";
import ServicesPage from "./pages/HomePages/ServicesPage.jsx";
import StaffLogin from "./pages/staffManegmentPages/StaffLogin";
import PaymentPage from "./pages/Payment/PaymentPage";
import PaymentCancel from "./pages/CancelTheRegistration/PaymentCancel";

import supportiveCommunityRoutes from "./routes/supportive community/supportiveCommunityRoutes";
import communityStaffRoutes from "./routes/communityStaff/communityStaffRoutes";

function AttendanceFlow() {
  const [currentPage, setCurrentPage] = useState("menu");

  if (currentPage === "take") {
    return <TakeAttendancePage onBack={() => setCurrentPage("menu")} />;
  }

  if (currentPage === "records") {
    return <AttendanceRecordsPage onBack={() => setCurrentPage("menu")} />;
  }

  return <AttendancePage onNavigate={setCurrentPage} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plus60" element={<Plus60Page />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        <Route path="/attendance" element={<AttendanceFlow />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
