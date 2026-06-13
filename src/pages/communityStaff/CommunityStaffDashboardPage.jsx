import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCommunityStaffDashboardStats } from "../../services/communityStaff/communityStaffService";
import CommunityStaffDashboardSummary from "../../components/communityStaff/CommunityStaffDashboardSummary.jsx";
import CommunityStaffDashboardAlerts from "../../components/communityStaff/CommunityStaffDashboardAlerts.jsx";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "../../components/communityStaff/CommunityStaffMessage.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

const DASHBOARD_CARDS = [
  {
    id: "join-requests",
    title: "בקשות הצטרפות לקהילה תומכת",
    description: "צפייה, סינון וטיפול בבקשות הצטרפות חדשות",
    isAvailable: true,
    route: "/community-staff/join-requests",
  },
  {
    id: "community-members",
    title: "חברי קהילה",
    description: "ניהול חברי קהילה פעילים ומושבתים",
    isAvailable: true,
    route: "/community-staff/members",
  },
  {
    id: "volunteer-requests",
    title: "בקשות התנדבות",
    description: "ניהול בקשות התנדבות חדשות",
    isAvailable: true,
    route: "/community-staff/volunteer-requests",
  },
  {
    id: "volunteers-management",
    title: "מתנדבים",
    description: "ניהול מתנדבים פעילים ולא פעילים",
    isAvailable: true,
    route: "/community-staff/volunteers",
  },
  {
    id: "support-requests",
    title: "בקשות סיוע והתאמות",
    description: "ניהול בקשות סיוע והתאמות",
    isAvailable: true,
    route: "/community-staff/help-requests",
  },
  {
    id: "active-matches",
    title: "התאמות פעילות",
    description: "צפייה וניהול התאמות שאושרו על ידי הצוות",
    isAvailable: true,
    route: "/community-staff/active-matches",
  },
];

const EMPTY_STATS = {
  activeCommunityMembers: 0,
  activeVolunteers: 0,
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

  const handleCardClick = (card) => {
    if (card.isAvailable) {
      navigate(card.route);
      return;
    }

    showInfo("המודול עדיין לא זמין");
  };

  return (
    <div className="community-staff-dashboard" dir="rtl">
      <div className="community-staff-dashboard__container">
        <header className="community-staff-dashboard__header">
          <h1 className="community-staff-dashboard__title">לוח בקרה — צוות קהילה</h1>
          <p className="community-staff-dashboard__subtitle">
            גישה לניהול בקשות ולטיפול שוטף בפעילות הקהילה התומכת
          </p>
        </header>

        <CommunityStaffMessage message={message} onDismiss={clearMessage} />

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

        <section
          className="community-staff-dashboard__section community-staff-dashboard__modules"
          aria-label="מודולי מערכת"
        >
          <h2 className="community-staff-dashboard__section-title">מודולים</h2>

          <div className="community-staff-dashboard__cards">
            {DASHBOARD_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`community-staff-dashboard__card${
                  card.isAvailable
                    ? " community-staff-dashboard__card--active"
                    : " community-staff-dashboard__card--unavailable"
                }`}
                onClick={() => handleCardClick(card)}
                aria-disabled={!card.isAvailable}
              >
                <span className="community-staff-dashboard__card-content">
                  <span className="community-staff-dashboard__card-title">
                    {card.title}
                  </span>
                  <span className="community-staff-dashboard__card-description">
                    {card.description}
                  </span>
                </span>
                {!card.isAvailable && (
                  <span className="community-staff-dashboard__card-status">
                    לא זמין
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CommunityStaffDashboardPage;
