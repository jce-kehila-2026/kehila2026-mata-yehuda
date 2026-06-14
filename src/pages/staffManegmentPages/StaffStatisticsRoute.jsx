import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { auth, db } from "../../config/firebase";
import {
    STAFF_ROLE_SUPPORTIVE_COMMUNITY,
    normalizeStaffRole
} from "../../config/staffRoles";
import StaffStatistics from "./StaffStatistics";

function StaffStatisticsRoute() {
    const navigate = useNavigate();
    const [state, setState] = useState({
        loading: true,
        allowed: false,
        redirectToCommunityStaff: false
    });

    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setState({
                    loading: false,
                    allowed: false,
                    redirectToCommunityStaff: false
                });
                return;
            }

            try {
                const staffSnap = await getDoc(doc(db, "staff", user.uid));

                if (!staffSnap.exists()) {
                    setState({
                        loading: false,
                        allowed: false,
                        redirectToCommunityStaff: false
                    });
                    return;
                }

                const staffData = staffSnap.data();

                if (!staffData.is_active) {
                    setState({
                        loading: false,
                        allowed: false,
                        redirectToCommunityStaff: false
                    });
                    return;
                }

                if (
                    normalizeStaffRole(staffData.role) ===
                    STAFF_ROLE_SUPPORTIVE_COMMUNITY
                ) {
                    setState({
                        loading: false,
                        allowed: false,
                        redirectToCommunityStaff: true
                    });
                    return;
                }

                setState({
                    loading: false,
                    allowed: true,
                    redirectToCommunityStaff: false
                });
            } catch {
                setState({
                    loading: false,
                    allowed: false,
                    redirectToCommunityStaff: false
                });
            }
        });
    }, []);

    if (state.loading) {
        return (
            <div className="staff-statistics-page" dir="rtl">
                <div className="staff-statistics-state" role="status">
                    <Loader2
                        className="staff-statistics-state__spinner"
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                    <p>טוען…</p>
                </div>
            </div>
        );
    }

    if (state.redirectToCommunityStaff) {
        return <Navigate to="/community-staff" replace />;
    }

    if (!state.allowed) {
        return <Navigate to="/staff-login" replace />;
    }

    return (
        <StaffStatistics onBack={() => navigate("/staff-login")} />
    );
}

export default StaffStatisticsRoute;
