import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { getCommunityStaffDashboardStats } from "../../services/communityStaff/communityStaffService";

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

        const dashboardStats = await getCommunityStaffDashboardStats();



        if (isMounted) {

          setStats(dashboardStats);

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

            <span className="community-staff-dashboard__title-icon" aria-hidden="true">

              <svg viewBox="0 0 32 32" fill="none">

                <path

                  d="M16 4C12 10 8 12 6 16c2 2 4 2 6 0 0 4-2 8-4 10 2 6 6 8 10-2 2-4 2-6 0-2 4-4 8-6 10 2-2 4-4 6-8 2 4 4 6 6 8-2-2-4-6-6-10 2 2 4 2 6 0-2-4-6-6-10-12-2z"

                  fill="#3d9b56"

                />

                <path

                  d="M20 6c-2 4-4 6-6 8 1 1 2 1 3 0 0 2-1 4-2 5 1-1 2-2 3-4 1 2 2 3 3 4-1-1-2-3-3-5 1 1 2 1 3 0-1-2-3-4-6-8z"

                  fill="#2d7d46"

                  opacity="0.85"

                />

              </svg>

            </span>

          </h1>

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
