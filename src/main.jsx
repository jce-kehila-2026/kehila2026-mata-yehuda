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
import "./styles/staffManegmentStyles/activitiesManagement.css";
import "./styles/staffManegmentStyles/participants.css";
import "./styles/staffManegmentStyles/staffManagement.css";
import "./styles/staffManegmentStyles/listManagement.css";
import "./styles/staffManegmentStyles/programs.css";
import "./styles/staffManegmentStyles/programsManagement.css";
import "./styles/staffManegmentStyles/dayCenterSchedule.css";
import "./styles/staffManegmentStyles/dayCenterVolunteers.css";
import "./styles/staffManegmentStyles/registrations.css";
import "./styles/staffManegmentStyles/requests.css";
import "./styles/staffManegmentStyles/cancellations.css";
import "./styles/staffManegmentStyles/messages.css";
import "./styles/staffManegmentStyles/staffStatistics.css";
import "./styles/staffManegmentStyles/donations.css";
import "./styles/Payment/global.css";
import "./styles/Payment/registration.css";

import FirebaseConfigError from "./components/FirebaseConfigError.jsx";
import { validateFirebaseEnvironmentAtStartup } from "./config/firebaseEnvironment";
import { validateFcmEnvironmentAtStartup } from "./config/fcmEnvironment";

const firebaseEnv = validateFirebaseEnvironmentAtStartup();
validateFcmEnvironmentAtStartup();

const root = createRoot(document.getElementById("root"));

if (!firebaseEnv.ok) {
    root.render(
        <StrictMode>
            <FirebaseConfigError missing={firebaseEnv.missing} />
        </StrictMode>
    );
} else {
    import("./App.jsx").then(({ default: App }) => {
        root.render(
            <StrictMode>
                <App />
            </StrictMode>
        );
    });
}
