import { useCallback, useEffect, useMemo, useState } from "react";
import { getActiveVolunteerMatches } from "../../services/communityStaff/communityStaffService";
import {
  CommunityStaffCompactCard,
  CommunityStaffEmptyState,
  CommunityStaffListToolbar,
  CommunityStaffMatchBadge,
  CommunityStaffPagination,
  CommunityStaffStatusOverview,
  Link2,
  buildMatchesOverviewItems,
} from "./CommunityStaffListUi.jsx";

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
      <CommunityStaffStatusOverview items={buildMatchesOverviewItems(matches)} />

      <CommunityStaffListToolbar
        searchId="active-matches-search"
        searchValue={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        searchPlaceholder="חיפוש לפי שם או טלפון של משתתף/מתנדב..."
        pageSizeId="active-matches-page-size"
        pageSizeValue={pageSize}
        onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        showFilter={false}
      />

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

      {filteredMatches.length > 0 && (
        <CommunityStaffPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNext={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
        />
      )}
    </div>
  );
}

export default ActiveVolunteerMatchesTable;
