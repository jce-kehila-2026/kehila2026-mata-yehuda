import { Navigate, Route, Routes as RouterRoutes } from "react-router-dom";

import RequestsPage from "../../pages/RequestsPage";

function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate to="/requests" replace />} />
      <Route path="/requests" element={<RequestsPage />} />
    </RouterRoutes>
  );
}

export default Routes;
