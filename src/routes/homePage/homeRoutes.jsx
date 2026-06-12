// src/routes/homeRoutes.jsx

import Home from "../pages/HomePages/Home";
import AboutPage from "../pages/HomePages/AboutPage";
import ServicesPage from "../pages/HomePages/ServicesPage";
import Plus60Page from "../pages/HomePages/Plus60Page";

const homeRoutes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/services",
    element: <ServicesPage />,
  },
  {
    path: "/plus60",
    element: <Plus60Page />,
  },
];

export default homeRoutes;