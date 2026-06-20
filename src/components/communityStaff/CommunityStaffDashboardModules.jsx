const MODULE_IMAGE_BY_ART = {
  join: "/images/community-staff-dashboard/clipboard.png",
  volunteer: "/images/community-staff-dashboard/hands-heart.png",
  members: "/images/community-staff-dashboard/people.png",
  volunteers: "/images/community-staff-dashboard/volunteer.png",
  matches: "/images/community-staff-dashboard/puzzle.png",
  support: "/images/community-staff-dashboard/megaphone.png",
  settings: "/images/community-staff-dashboard/Settings.png",
};

const MODULE_CARDS = [
  {
    id: "join-requests",
    kind: "request",
    title: "בקשות הצטרפות",
    description: "ניהול בקשות חדשות",
    artClass: "join",
    isAvailable: true,
    route: "/community-staff/join-requests",
    statKey: "pendingJoinRequests",
    badgeType: "requests",
  },
  {
    id: "volunteer-requests",
    kind: "request",
    title: "בקשות התנדבות",
    description: "ניהול בקשות מתנדבים חדשות",
    artClass: "volunteer",
    isAvailable: true,
    route: "/community-staff/volunteer-requests",
    statKey: "pendingVolunteerRequests",
    badgeType: "requests",
  },
  {
    id: "community-members",
    kind: "management",
    title: "חברי קהילה",
    description: "ניהול חברים פעילים ומושבתים",
    artClass: "members",
    isAvailable: true,
    route: "/community-staff/members",
    statKey: "activeCommunityMembers",
    badgeType: "active-people",
  },
  {
    id: "volunteers-management",
    kind: "management",
    title: "מתנדבים",
    description: "ניהול מתנדבים פעילים ולא פעילים",
    artClass: "volunteers",
    isAvailable: true,
    route: "/community-staff/volunteers",
    statKey: "activeVolunteers",
    badgeType: "active-people",
  },
  {
    id: "active-matches",
    kind: "management",
    title: "התאמות פעילות",
    description: "ניהול התאמות שאושרו",
    artClass: "matches",
    isAvailable: true,
    route: "/community-staff/active-matches",
    statKey: "activeMatches",
    badgeType: "matches",
  },
  {
    id: "support-requests",
    kind: "request",
    title: "בקשות סיוע והתאמות",
    description: "ניהול בקשות סיוע",
    artClass: "support",
    isAvailable: true,
    route: "/community-staff/help-requests",
    statKey: "pendingHelpRequests",
    badgeType: "requests",
  },
  {
    id: "community-settings",
    kind: "management",
    title: "הגדרות קהילה",
    description: "ניהול שפות וסוגי עזרה",
    artClass: "settings",
    isAvailable: true,
    route: "/community-staff/settings",
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
    if (count === 1) {
      return "1 בקשה";
    }

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
    <section className="community-staff-dashboard__modules" aria-label="מודולי מערכת">
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
              <span className="community-staff-dashboard__module-card-header">
                <span className="community-staff-dashboard__module-card-title">
                  {card.title}
                </span>
                <span className="community-staff-dashboard__module-card-description">
                  {card.description}
                </span>
              </span>

              <span className="community-staff-dashboard__module-card-art" aria-hidden="true">
                <img
                  className="community-staff-dashboard__module-image"
                  src={MODULE_IMAGE_BY_ART[card.artClass]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </span>

              {badgeText && (
                <span className="community-staff-dashboard__module-card-pill">
                  {badgeText}
                </span>
              )}

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
