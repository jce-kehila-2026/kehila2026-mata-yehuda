import { useNavigate } from "react-router-dom";
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

function CommunityStaffDashboardPage() {
  const navigate = useNavigate();

  const handleCardClick = (card) => {
    if (card.isAvailable) {
      navigate(card.route);
      return;
    }

    alert("בקרוב");
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

        <section className="community-staff-dashboard__section" aria-label="מודולי מערכת">
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
