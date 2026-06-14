import { useCallback, useEffect, useMemo, useState } from "react";
import { getActiveVolunteerMatches } from "../../services/communityStaff/communityStaffService";
import { CommunityStaffCompactCard } from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeMatches = await getActiveVolunteerMatches();
      setMatches(activeMatches);
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

  if (loading) {
    return (
      <p className="community-active-matches__loading">טוען התאמות פעילות...</p>
    );
  }

  if (error) {
    return <p className="community-active-matches__error">{error}</p>;
  }

  return (
    <div className="community-active-matches">
      <div className="community-active-matches__top-row">
        <span className="community-active-matches__badge">
          התאמות פעילות {matches.length}
        </span>
      </div>

      <div className="community-active-matches__toolbar">
        <div className="community-active-matches__search">
          <label htmlFor="active-matches-search">חיפוש</label>
          <input
            id="active-matches-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם או טלפון של משתתף/מתנדב..."
          />
        </div>

        <div className="community-active-matches__page-size">
          <label htmlFor="active-matches-page-size">שורות בעמוד</label>
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

      <div className="community-active-matches__card">
        {filteredMatches.length === 0 ? (
          <p className="community-active-matches__empty">
            {matches.length === 0
              ? "אין התאמות פעילות להצגה"
              : "לא נמצאו תוצאות לפי החיפוש"}
          </p>
        ) : (
          <ul className="community-staff-compact-list">
            {paginatedMatches.map((match) => (
              <CommunityStaffCompactCard
                key={match.id}
                name={match.participantFullName}
                phone={match.participantPhone}
                status={
                  <span className="community-volunteers-mgmt__status community-volunteers-mgmt__status--active">
                    התאמה פעילה
                  </span>
                }
                primaryLabel="ניהול התאמה"
                onPrimaryClick={() => onManageMatch(match)}
                onViewDetails={() => onViewDetails(match)}
              />
            ))}
          </ul>
        )}
      </div>

      {filteredMatches.length > 0 && (
        <div className="community-active-matches__pagination">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            הקודם
          </button>
          <span>
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}

export default ActiveVolunteerMatchesTable;
