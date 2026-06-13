import { useCallback, useEffect, useMemo, useState } from "react";
import { getCommunityMembers } from "../../services/communityStaff/communityStaffService";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

function getStatusLabel(status) {
  if (status === "active") {
    return "פעיל";
  }

  if (status === "inactive") {
    return "לא פעיל";
  }

  return status || "—";
}

function matchesSearch(member, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchableValues = [
    member.fullNameDisplay,
    member.idNumberDisplay,
    member.phone,
    member.requestedServicesDisplay,
    member.languagesDisplay,
    member.monthlyPriceDisplay,
    getStatusLabel(member.status),
  ];

  return searchableValues.some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedSearch)
  );
}

function CommunityMembersTable({
  refreshKey = 0,
  onEditMember,
  onViewDetails,
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const communityMembers = await getCommunityMembers();
      setMembers(communityMembers);
    } catch (err) {
      console.error("Failed to load community members:", err);
      setError("שגיאה בטעינת חברי הקהילה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers, refreshKey]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (!matchesSearch(member, searchTerm)) {
        return false;
      }

      if (statusFilter !== "all" && member.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [members, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));

  const paginatedMembers = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return filteredMembers.slice(startIndex, startIndex + pageSize);
  }, [filteredMembers, currentPage, pageSize, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return <p className="community-members__loading">טוען חברי קהילה...</p>;
  }

  if (error) {
    return <p className="community-members__error">{error}</p>;
  }

  return (
    <div className="community-members">
      <div className="community-members__top-row">
        <span className="community-members__badge">
          חברי קהילה {members.length}
        </span>
      </div>

      <div className="community-members__toolbar">
        <div className="community-members__search">
          <label htmlFor="community-members-search">חיפוש</label>
          <input
            id="community-members-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם, ת.ז., טלפון, שירות או שפה..."
          />
        </div>

        <div className="community-members__filter">
          <label htmlFor="community-members-filter">סטטוס</label>
          <select
            id="community-members-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">הכל</option>
            <option value="active">פעיל</option>
            <option value="inactive">לא פעיל</option>
          </select>
        </div>

        <div className="community-members__page-size">
          <label htmlFor="community-members-page-size">שורות בעמוד</label>
          <select
            id="community-members-page-size"
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

      <div className="community-members__card">
        {filteredMembers.length === 0 ? (
          <p className="community-members__empty">
            {members.length === 0
              ? "אין חברי קהילה להצגה"
              : "לא נמצאו תוצאות לפי החיפוש או הסינון"}
          </p>
        ) : (
          <ul className="community-members__list">
            {paginatedMembers.map((member) => (
              <li key={member.id} className="community-members__member-card">
                <div className="community-members__member-card-info">
                  <span className="community-members__member-card-name">
                    {member.fullNameDisplay}
                  </span>
                  <span className="community-members__member-card-phone">
                    {member.phone}
                  </span>
                  <span
                    className={`community-members__status community-members__status--${member.status}`}
                  >
                    {getStatusLabel(member.status)}
                  </span>
                </div>

                <div className="community-members__member-card-actions">
                  <button
                    type="button"
                    className="community-members__action-btn"
                    onClick={() => onEditMember(member)}
                  >
                    עריכת פרטי חבר
                  </button>

                  <button
                    type="button"
                    className="community-members__action-btn community-members__action-btn--secondary"
                    onClick={() => onViewDetails(member)}
                  >
                    הצגת פרטים
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {filteredMembers.length > 0 && (
        <div className="community-members__pagination">
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

export default CommunityMembersTable;
