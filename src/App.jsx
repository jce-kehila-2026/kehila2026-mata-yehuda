import { BrowserRouter, Routes, Route } from "react-router-dom";
import supportiveCommunityRoutes from "./routes/supportive community/supportiveCommunityRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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