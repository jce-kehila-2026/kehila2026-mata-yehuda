import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllVolunteers } from "../../services/communityStaff/communityStaffService";
import { CommunityStaffCompactCard } from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

function matchesSearch(volunteer, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchableValues = [
    volunteer.searchFirstName,
    volunteer.searchLastName,
    volunteer.phoneDisplay,
    volunteer.addressDisplay,
    volunteer.fullNameDisplay,
  ];

  return searchableValues.some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedSearch)
  );
}

function matchesActiveFilter(volunteer, activeFilter) {
  if (activeFilter === "all") {
    return true;
  }

  if (activeFilter === "active") {
    return volunteer.is_active === true;
  }

  if (activeFilter === "inactive") {
    return volunteer.is_active !== true;
  }

  return true;
}

function VolunteersManagementTable({
  refreshKey = 0,
  onEditVolunteer,
  onViewDetails,
}) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allVolunteers = await getAllVolunteers();
      setVolunteers(allVolunteers);
    } catch (err) {
      console.error("Failed to load volunteers:", err);
      setError("שגיאה בטעינת המתנדבים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers, refreshKey]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      if (!matchesSearch(volunteer, searchTerm)) {
        return false;
      }

      return matchesActiveFilter(volunteer, activeFilter);
    });
  }, [volunteers, searchTerm, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredVolunteers.length / pageSize));

  const paginatedVolunteers = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return filteredVolunteers.slice(startIndex, startIndex + pageSize);
  }, [filteredVolunteers, currentPage, pageSize, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <p className="community-volunteers-mgmt__loading">טוען מתנדבים...</p>
    );
  }

  if (error) {
    return <p className="community-volunteers-mgmt__error">{error}</p>;
  }

  return (
    <div className="community-volunteers-mgmt">
      <div className="community-volunteers-mgmt__top-row">
        <span className="community-volunteers-mgmt__badge">
          מתנדבים {volunteers.length}
        </span>
      </div>

      <div className="community-volunteers-mgmt__toolbar">
        <div className="community-volunteers-mgmt__search">
          <label htmlFor="volunteers-mgmt-search">חיפוש</label>
          <input
            id="volunteers-mgmt-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם, טלפון או כתובת..."
          />
        </div>

        <div className="community-volunteers-mgmt__filter">
          <label htmlFor="volunteers-mgmt-filter">סטטוס פעילות</label>
          <select
            id="volunteers-mgmt-filter"
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
          >
            <option value="all">כל המתנדבים</option>
            <option value="active">מתנדבים פעילים</option>
            <option value="inactive">מתנדבים לא פעילים</option>
          </select>
        </div>

        <div className="community-volunteers-mgmt__page-size">
          <label htmlFor="volunteers-mgmt-page-size">שורות בעמוד</label>
          <select
            id="volunteers-mgmt-page-size"
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

      <div className="community-volunteers-mgmt__card">
        {filteredVolunteers.length === 0 ? (
          <p className="community-volunteers-mgmt__empty">
            {volunteers.length === 0
              ? "אין מתנדבים להצגה"
              : "לא נמצאו תוצאות לפי החיפוש או הסינון"}
          </p>
        ) : (
          <ul className="community-staff-compact-list">
            {paginatedVolunteers.map((volunteer) => (
              <CommunityStaffCompactCard
                key={volunteer.id}
                name={volunteer.fullNameDisplay}
                phone={volunteer.phoneDisplay}
                status={
                  <span
                    className={`community-volunteers-mgmt__status community-volunteers-mgmt__status--${
                      volunteer.is_active === true ? "active" : "inactive"
                    }`}
                  >
                    {volunteer.activeStatusDisplay}
                  </span>
                }
                primaryLabel="עריכת פרטים"
                onPrimaryClick={() => onEditVolunteer(volunteer)}
                onViewDetails={() => onViewDetails(volunteer)}
              />
            ))}
          </ul>
        )}
      </div>

      {filteredVolunteers.length > 0 && (
        <div className="community-volunteers-mgmt__pagination">
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

export default VolunteersManagementTable;
