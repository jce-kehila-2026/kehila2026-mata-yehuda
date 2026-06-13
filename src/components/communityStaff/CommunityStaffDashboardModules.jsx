const MODULE_CARDS = [
  {
    id: "join-requests",
    kind: "request",
    title: "בקשות הצטרפות לקהילה תומכת",
    description: "ניהול בקשות חדשות",
    isAvailable: true,
    route: "/community-staff/join-requests",
  },
  {
    id: "community-members",
    kind: "management",
    title: "חברי קהילה",
    description: "ניהול חברים פעילים ומושבתים",
    isAvailable: true,
    route: "/community-staff/members",
    statKey: "activeCommunityMembers",
    badgeType: "active-people",
  },
  {
    id: "volunteer-requests",
    kind: "request",
    title: "בקשות התנדבות",
    description: "ניהול בקשות חדשות",
    isAvailable: true,
    route: "/community-staff/volunteer-requests",
  },
  {
    id: "volunteers-management",
    kind: "management",
    title: "מתנדבים",
    description: "ניהול מתנדבים פעילים ולא פעילים",
    isAvailable: true,
    route: "/community-staff/volunteers",
    statKey: "activeVolunteers",
    badgeType: "active-people",
  },
  {
    id: "support-requests",
    kind: "request",
    title: "בקשות סיוע והתאמות",
    description: "ניהול בקשות סיוע",
    isAvailable: true,
    route: "/community-staff/help-requests",
    statKey: "pendingHelpRequests",
    badgeType: "requests",
  },
  {
    id: "active-matches",
    kind: "management",
    title: "התאמות פעילות",
    description: "ניהול התאמות שאושרו",
    isAvailable: true,
    route: "/community-staff/active-matches",
    statKey: "activeMatches",
    badgeType: "matches",
  },
];

function getModuleBadgeText(count, badgeType) {
  if (typeof count !== "number") {
    return null;
  }

  if (badgeType === "active-people") {
    return count === 1 ? "1 פעיל" : `${count} פעילים`;
  }

  if (badgeType === "requests") {
    return `${count} בקשות`;
  }

  if (badgeType === "matches") {
    return count === 1 ? "1 התאמה" : `${count} התאמות`;
  }

  return null;
}

function CommunityStaffDashboardModules({
  stats,
  statsLoading,
  onNavigate,
  onUnavailableClick,
}) {
  return (
    <section
      className="community-staff-dashboard__section community-staff-dashboard__modules"
      aria-label="מודולי מערכת"
    >
      <h2 className="community-staff-dashboard__section-title">מודולים</h2>

      <div className="community-staff-dashboard__module-grid">
        {MODULE_CARDS.map((card) => {
          const badgeText =
            !statsLoading && card.statKey
              ? getModuleBadgeText(stats[card.statKey], card.badgeType)
              : null;

          return (
            <button
              key={card.id}
              type="button"
              className={`community-staff-dashboard__module-card community-staff-dashboard__module-card--${card.kind}${
                card.isAvailable
                  ? ""
                  : " community-staff-dashboard__module-card--unavailable"
              }`}
              onClick={() => {
                if (card.isAvailable) {
                  onNavigate(card.route);
                  return;
                }

                onUnavailableClick();
              }}
              aria-disabled={!card.isAvailable}
            >
              <span className="community-staff-dashboard__module-card-main">
                <span className="community-staff-dashboard__module-card-heading">
                  <span className="community-staff-dashboard__module-card-title">
                    {card.title}
                  </span>
                  {badgeText && (
                    <span className="community-staff-dashboard__module-card-badge">
                      {badgeText}
                    </span>
                  )}
                </span>
                <span className="community-staff-dashboard__module-card-description">
                  {card.description}
                </span>
              </span>
              {!card.isAvailable && (
                <span className="community-staff-dashboard__module-card-status">
                  לא זמין
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CommunityStaffDashboardModules;
