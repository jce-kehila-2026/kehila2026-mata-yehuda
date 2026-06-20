import { useNavigate } from "react-router-dom";
import StaffStatistics from "./StaffStatistics";

function StaffStatisticsRoute() {
    const navigate = useNavigate();

    return (
        <StaffStatistics onBack={() => navigate("/staff/dashboard")} />
    );
}

export default StaffStatisticsRoute;
