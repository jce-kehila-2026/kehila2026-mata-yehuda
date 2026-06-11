import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/Payment/global.css";
import "./styles/Payment/registration.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
