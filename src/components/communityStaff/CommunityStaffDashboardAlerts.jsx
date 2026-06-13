function CommunityStaffDashboardAlerts({
  unmatchedPendingRequests,
  loading,
  error,
  onNavigateToHelpRequests,
}) {
  return (
    <section
      className="community-staff-dashboard__section community-staff-dashboard__alerts"
      aria-label="דורש טיפול"
    >
      <h2 className="community-staff-dashboard__section-title">דורש טיפול</h2>

      {loading && (
        <p className="community-staff-dashboard__alerts-loading">טוען התראות...</p>
      )}

      {error && (
        <p className="community-staff-dashboard__alerts-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="community-staff-dashboard__alerts-list">
          <button
            type="button"
            className="community-staff-dashboard__alert"
            onClick={onNavigateToHelpRequests}
          >
            <span className="community-staff-dashboard__alert-count">
              {unmatchedPendingRequests}
            </span>
            <span className="community-staff-dashboard__alert-text">
              בקשות ללא התאמה
            </span>
          </button>
        </div>
      )}
    </section>
  );
}

export default CommunityStaffDashboardAlerts;
