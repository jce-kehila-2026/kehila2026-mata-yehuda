import { useNavigate } from "react-router-dom";
import StaffDashboard from "./StaffDashboard";

function StaffDashboardRoute() {
  const navigate = useNavigate();

  return (
    <StaffDashboard
      onLogout={() => {
        navigate("/staff-login", { replace: true });
      }}
    />
  );
}

export default StaffDashboardRoute;
