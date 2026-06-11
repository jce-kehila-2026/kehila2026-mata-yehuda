import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePages/Home.jsx";
import Plus60Page from "./pages/HomePages/Plus60Page.jsx";
import AboutPage from "./pages/HomePages/AboutPage.jsx";
import ServicesPage from "./pages/HomePages/ServicesPage.jsx";
import StaffLogin from "./pages/staffManegmentPages/StaffLogin";

import supportiveCommunityRoutes from "./routes/supportive community/supportiveCommunityRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main pages */}
        <Route path="/" element={<Home />} />
        <Route path="/plus60" element={<Plus60Page />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/staff-login" element={<StaffLogin />} />

        {/* Supportive Community routes */}
        {supportiveCommunityRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;