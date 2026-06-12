import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./styles/responsive.css";
import "./styles/staffManegmentStyles/theme.css";
import "./styles/staffManegmentStyles/formCommon.css";
import "./styles/staffManegmentStyles/staffCommon.css";
import "./styles/staffManegmentStyles/adminList.css";
import "./styles/staffManegmentStyles/dashboard.css";
import "./styles/staffManegmentStyles/staffLogin.css";
import "./styles/staffManegmentStyles/formImageUpload.css";
import "./styles/staffManegmentStyles/activities.css";
import "./styles/staffManegmentStyles/participants.css";
import "./styles/staffManegmentStyles/staffManagement.css";
import "./styles/staffManegmentStyles/programs.css";
import "./styles/staffManegmentStyles/registrations.css";
import "./styles/staffManegmentStyles/requests.css";
import "./styles/staffManegmentStyles/cancellations.css";
import "./styles/staffManegmentStyles/messages.css";
import "./styles/Payment/global.css";
import "./styles/Payment/registration.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);