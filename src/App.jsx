import { BrowserRouter, Routes, Route } from "react-router-dom";
import supportiveCommunityRoutes from "./routes/supportive community/supportiveCommunityRoutes";
import communityStaffRoutes from "./routes/communityStaff/communityStaffRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
