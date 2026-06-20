function CommunityStaffDashboardAlerts({
  unmatchedPendingRequests,
  loading,
  error,
  onNavigateToHelpRequests,
}) {
  return (
    <section
      className="community-staff-dashboard__alerts"
      aria-label="דורש טיפול"
    >
      <div className="community-staff-dashboard__alerts-header">
        <span className="community-staff-dashboard__alerts-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
        <h2 className="community-staff-dashboard__alerts-title">דורש טיפול</h2>
      </div>

      {loading && (
        <p className="community-staff-dashboard__alerts-loading">טוען התראות...</p>
      )}

      {error && (
        <p className="community-staff-dashboard__alerts-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <button
          type="button"
          className="community-staff-dashboard__alert"
          onClick={onNavigateToHelpRequests}
        >
          <span className="community-staff-dashboard__alert-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </span>
          <span className="community-staff-dashboard__alert-text">
            בקשות ללא התאמה
          </span>
          <span className="community-staff-dashboard__alert-count">
            {unmatchedPendingRequests}
          </span>
        </button>
      )}
    </section>
  );
}

export default CommunityStaffDashboardAlerts;
