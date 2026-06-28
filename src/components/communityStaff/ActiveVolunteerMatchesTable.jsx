import { useCallback, useEffect, useMemo, useState } from "react";
import { Link2, Users, UserCheck } from "lucide-react";
import {
  getActiveVolunteerMatches,
  getPendingHomeHelpRequests,
} from "../../services/communityStaff/communityStaffService";
import {
  CommunityStaffCompactCard,
  CommunityStaffEmptyState,
  CommunityStaffMatchBadge,
} from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function matchesSearch(match, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchableValues = [
    match.participantFullName,
    match.participantPhone,
    match.volunteerFullName,
    match.volunteerPhone,
    match.participantIdNumber,
  ];

  return searchableValues.some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedSearch)
  );
}

function ActiveVolunteerMatchesTable({
  refreshKey = 0,
  onManageMatch,
  onViewDetails,
}) {
  const [matches, setMatches] = useState([]);
  const [pendingMatchCount, setPendingMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [activeMatches, pendingRequests] = await Promise.all([
        getActiveVolunteerMatches(),
        getPendingHomeHelpRequests(),
      ]);
      setMatches(activeMatches);
      setPendingMatchCount(pendingRequests.length);
    } catch (err) {
      console.error("Failed to load active volunteer matches:", err);
      setError("שגיאה בטעינת התאמות פעילות");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches, refreshKey]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => matchesSearch(match, searchTerm));
  }, [matches, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / pageSize));

  const paginatedMatches = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return filteredMatches.slice(startIndex, startIndex + pageSize);
  }, [filteredMatches, currentPage, pageSize, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const matchStats = useMemo(() => {
    const active = matches.length;

    return {
      total: active + pendingMatchCount,
      active,
      pending: pendingMatchCount,
    };
  }, [matches, pendingMatchCount]);

  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="community-active-matches">
      {!loading && !error ? (
        <section
          className="activities-mgmt-summary"
          aria-label="סיכום התאמות פעילות"
        >
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
            <span className="activities-mgmt-summary__icon">
              <Link2 size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {matchStats.total}
            </span>
            <span className="activities-mgmt-summary__label">
              סה״כ התאמות
            </span>
            <span className="activities-mgmt-summary__hint">
              כלל ההתאמות והבקשות במערכת
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--participants">
            <span className="activities-mgmt-summary__icon">
              <Users size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {matchStats.active}
            </span>
            <span className="activities-mgmt-summary__label">
              התאמות פעילות
            </span>
            <span className="activities-mgmt-summary__hint">
              התאמות פעילות כרגע
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--open">
            <span className="activities-mgmt-summary__icon">
              <UserCheck size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {matchStats.pending}
            </span>
            <span className="activities-mgmt-summary__label">
              התאמות ממתינות
            </span>
            <span className="activities-mgmt-summary__hint">
              בקשות הממתינות להתאמה
            </span>
          </div>
        </section>
      ) : null}

      <div className="admin-list-toolbar staff-form staff-list-filters">
        <div className="admin-list-toolbar__search">
          <label htmlFor="active-matches-search">חיפוש</label>
          <input
            id="active-matches-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם או טלפון של משתתף/מתנדב..."
          />
        </div>

        <div className="admin-list-toolbar__page-size">
          <label htmlFor="active-matches-page-size">מספר התאמות בעמוד</label>
          <select
            id="active-matches-page-size"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p className="staff-alert staff-alert--error">{error}</p>
      ) : null}

      {loading ? (
        <p className="activities-mgmt-loading">טוען התאמות פעילות...</p>
      ) : null}

      {!loading && !error ? (
        <div className="community-staff-request-list community-active-matches__card">
        {filteredMatches.length === 0 ? (
          <CommunityStaffEmptyState
            icon={Link2}
            message={
              matches.length === 0
                ? "אין נתונים להצגה כרגע"
                : "לא נמצאו תוצאות לפי החיפוש"
            }
          />
        ) : (
          <ul className="community-staff-compact-list">
            {paginatedMatches.map((match) => (
              <CommunityStaffCompactCard
                key={match.id}
                name={match.participantFullName}
                phone={match.participantPhone}
                status={<CommunityStaffMatchBadge />}
                viewLabel="צפייה"
                primaryLabel="ניהול"
                onPrimaryClick={() => onManageMatch(match)}
                onViewDetails={() => onViewDetails(match)}
              />
            ))}
          </ul>
        )}
        </div>
      ) : null}

      {!loading && !error && filteredMatches.length > 0 ? (
        <div className="activities-mgmt-pagination">
          <button
            type="button"
            className="activities-mgmt-pagination__btn"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage <= 1}
          >
            הקודם
          </button>
          <span className="activities-mgmt-pagination__label">
            עמוד {safePage} מתוך {totalPages}
          </span>
          <button
            type="button"
            className="activities-mgmt-pagination__btn"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={safePage >= totalPages}
          >
            הבא
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ActiveVolunteerMatchesTable;
