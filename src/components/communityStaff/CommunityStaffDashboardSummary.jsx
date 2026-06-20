const SUMMARY_ITEMS = [
  {
    id: "pending-requests",
    label: "בקשות הצטרפות",
    key: "pendingJoinRequests",
    route: "/community-staff/join-requests",
    accent: "orange",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    id: "active-members",
    label: "חברי קהילה",
    key: "activeCommunityMembers",
    route: "/community-staff/members",
    accent: "green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "active-volunteers",
    label: "מתנדבים",
    key: "activeVolunteers",
    route: "/community-staff/volunteers",
    accent: "green-dark",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: "active-matches",
    label: "התאמות פעילות",
    key: "activeMatches",
    route: "/community-staff/active-matches",
    accent: "green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

function CommunityStaffDashboardSummary({ stats, loading, error, onNavigate }) {
  if (loading) {
    return (
      <div className="community-staff-dashboard__summary" aria-label="סיכום נתונים">
        <p className="community-staff-dashboard__summary-loading">טוען נתונים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-staff-dashboard__summary" aria-label="סיכום נתונים">
        <p className="community-staff-dashboard__summary-error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="community-staff-dashboard__summary" aria-label="סיכום נתונים">
      <div className="community-staff-dashboard__summary-grid">
        {SUMMARY_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`community-staff-dashboard__summary-card community-staff-dashboard__summary-card--${item.accent}`}
            onClick={() => onNavigate(item.route)}
          >
            <span className="community-staff-dashboard__summary-card-top">
              <span className="community-staff-dashboard__summary-icon" aria-hidden="true">
                {item.icon}
              </span>
            </span>
            <span className="community-staff-dashboard__summary-value">
              {stats[item.key] ?? 0}
            </span>
            <span className="community-staff-dashboard__summary-label">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CommunityStaffDashboardSummary;
