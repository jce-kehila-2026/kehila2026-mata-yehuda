import { useNavigate } from "react-router-dom";
import StaffSubpageToolbar from "../../components/dashboard/StaffSubpageToolbar";
import StaffStatistics from "./StaffStatistics";

function StaffStatisticsRoute() {
    const navigate = useNavigate();

    return (
        <div className="staff-page staff-dashboard-root">
            <div className="staff-subpage">
                <StaffSubpageToolbar
                    title="סטטיסטיקות"
                    onBack={() => navigate("/staff/dashboard")}
                />
                <StaffStatistics />
            </div>
        </div>
    );
}

export default StaffStatisticsRoute;
