import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { getCommunityStaffDashboardStats, getPendingVolunteerRequests } from "../../services/communityStaff/communityStaffService";

import CommunityStaffDashboardSummary from "../../components/communityStaff/CommunityStaffDashboardSummary.jsx";

import CommunityStaffDashboardAlerts from "../../components/communityStaff/CommunityStaffDashboardAlerts.jsx";

import CommunityStaffDashboardModules from "../../components/communityStaff/CommunityStaffDashboardModules.jsx";

import CommunityStaffMessage, {

  useCommunityStaffMessage,

} from "../../components/communityStaff/CommunityStaffMessage.jsx";

import "../../styles/communityStaff/CommunityStaffDashboard.css";



const EMPTY_STATS = {
  activeCommunityMembers: 0,
  activeVolunteers: 0,
  pendingJoinRequests: 0,
  pendingVolunteerRequests: 0,
  pendingHelpRequests: 0,
  activeMatches: 0,
  unmatchedPendingRequests: 0,
};



function CommunityStaffDashboardPage() {

  const navigate = useNavigate();

  const [stats, setStats] = useState(EMPTY_STATS);

  const [statsLoading, setStatsLoading] = useState(true);

  const [statsError, setStatsError] = useState(null);

  const { message, showInfo, clearMessage } = useCommunityStaffMessage();



  useEffect(() => {

    let isMounted = true;



    async function loadDashboardStats() {

      setStatsLoading(true);

      setStatsError(null);



      try {

        const [dashboardStats, pendingVolunteers] = await Promise.all([
          getCommunityStaffDashboardStats(),
          getPendingVolunteerRequests(),
        ]);



        if (isMounted) {

          setStats({
            ...dashboardStats,
            pendingVolunteerRequests: pendingVolunteers.length,
          });

        }

      } catch (error) {

        console.error("Failed to load dashboard stats:", error);



        if (isMounted) {

          setStatsError("שגיאה בטעינת נתוני לוח הבקרה");

        }

      } finally {

        if (isMounted) {

          setStatsLoading(false);

        }

      }

    }



    loadDashboardStats();



    return () => {

      isMounted = false;

    };

  }, []);



  return (

    <div className="community-staff-dashboard" dir="rtl">

      <div className="community-staff-dashboard__container">

        <header className="community-staff-dashboard__header">

          <h1 className="community-staff-dashboard__title page-title">
            לוח בקרה — צוות קהילה
          </h1>

          <p className="community-staff-dashboard__subtitle">
            ניהול חברי קהילה, מתנדבים, התאמות ובקשות
          </p>

        </header>



        <CommunityStaffMessage message={message} onDismiss={clearMessage} />



        <div className="community-staff-dashboard__overview">

          <CommunityStaffDashboardSummary

            stats={stats}

            loading={statsLoading}

            error={statsError}

            onNavigate={navigate}

          />



          <CommunityStaffDashboardAlerts

            unmatchedPendingRequests={stats.unmatchedPendingRequests}

            loading={statsLoading}

            error={statsError}

            onNavigateToHelpRequests={() => navigate("/community-staff/help-requests")}

          />

        </div>



        <CommunityStaffDashboardModules

          stats={stats}

          statsLoading={statsLoading}

          onNavigate={navigate}

          onUnavailableClick={() => showInfo("המודול עדיין לא זמין")}

        />

      </div>



      <div className="community-staff-dashboard__landscape-wrap">

        <img

          className="community-staff-dashboard__landscape-image"

          src="/images/community-staff-dashboard/landscape-footer.png"

          alt=""

          aria-hidden="true"

          loading="lazy"

          decoding="async"

          draggable="false"

        />

      </div>

    </div>

  );

}



export default CommunityStaffDashboardPage;
