import { BrowserRouter, Routes, Route } from "react-router-dom";
import communityStaffRoutes from "./routes/communityStaffRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {communityStaffRoutes.map((route) => (
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