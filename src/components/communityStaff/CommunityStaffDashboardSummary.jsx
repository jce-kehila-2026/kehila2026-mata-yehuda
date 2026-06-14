const SUMMARY_ITEMS = [
  {
    id: "active-members",
    label: "חברי קהילה פעילים",
    key: "activeCommunityMembers",
    route: "/community-staff/members",
  },
  {
    id: "active-volunteers",
    label: "מתנדבים פעילים",
    key: "activeVolunteers",
    route: "/community-staff/volunteers",
  },
  {
    id: "pending-requests",
    label: "בקשות הצטרפות ממתינות",
    key: "pendingJoinRequests",
    route: "/community-staff/join-requests",
  },
  {
    id: "active-matches",
    label: "התאמות פעילות",
    key: "activeMatches",
    route: "/community-staff/active-matches",
  },
];

function CommunityStaffDashboardSummary({ stats, loading, error, onNavigate }) {
  if (loading) {
    return (
      <section
        className="community-staff-dashboard__section community-staff-dashboard__summary"
        aria-label="סיכום נתונים"
      >
        <h2 className="community-staff-dashboard__section-title">סיכום</h2>
        <p className="community-staff-dashboard__summary-loading">טוען נתונים...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="community-staff-dashboard__section community-staff-dashboard__summary"
        aria-label="סיכום נתונים"
      >
        <h2 className="community-staff-dashboard__section-title">סיכום</h2>
        <p className="community-staff-dashboard__summary-error" role="alert">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section
      className="community-staff-dashboard__section community-staff-dashboard__summary"
      aria-label="סיכום נתונים"
    >
      <h2 className="community-staff-dashboard__section-title">סיכום</h2>

      <div className="community-staff-dashboard__summary-grid">
        {SUMMARY_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="community-staff-dashboard__summary-card"
            onClick={() => onNavigate(item.route)}
          >
            <span className="community-staff-dashboard__summary-value">
              {stats[item.key] ?? 0}
            </span>
            <span className="community-staff-dashboard__summary-label">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CommunityStaffDashboardSummary;
