import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, UserCheck, UserX } from "lucide-react";
import {
  getAllVolunteers,
  updateVolunteerActiveStatus,
} from "../../services/communityStaff/communityStaffService";
import {
  CommunityStaffCompactCard,
  CommunityStaffActiveBadge,
  CommunityStaffEmptyState,
} from "./CommunityStaffListUi.jsx";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

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

function sortVolunteersActiveFirst(items) {
  return [...items].sort((left, right) => {
    const leftActive = left.is_active === true;
    const rightActive = right.is_active === true;

    if (leftActive !== rightActive) {
      return leftActive ? -1 : 1;
    }

    return (left.fullNameDisplay || "").localeCompare(
      right.fullNameDisplay || "",
      "he"
    );
  });
}

function VolunteersManagementTable({
  refreshKey = 0,
  onEditVolunteer,
  onViewDetails,
  onVolunteerUpdated,
  onShowError,
}) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingActionVolunteer, setPendingActionVolunteer] = useState(null);
  const [pendingActionType, setPendingActionType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    const filtered = volunteers.filter((volunteer) => {
      if (!matchesSearch(volunteer, searchTerm)) {
        return false;
      }

      return matchesActiveFilter(volunteer, activeFilter);
    });

    return sortVolunteersActiveFirst(filtered);
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

  const volunteerStats = useMemo(() => {
    let active = 0;

    volunteers.forEach((volunteer) => {
      if (volunteer.is_active === true) {
        active += 1;
      }
    });

    return {
      total: volunteers.length,
      active,
      inactive: volunteers.length - active,
    };
  }, [volunteers]);

  const handleConfirmAction = async () => {
    if (!pendingActionVolunteer || !pendingActionType) {
      return;
    }

    setIsProcessing(true);

    try {
      const isActive = pendingActionType === "reactivate";
      await updateVolunteerActiveStatus(pendingActionVolunteer.id, isActive);
      onVolunteerUpdated?.({
        successMessage: isActive
          ? "המתנדב הופעל בהצלחה"
          : "המתנדב הושבת בהצלחה",
      });
      setPendingActionVolunteer(null);
      setPendingActionType(null);
      await loadVolunteers();
    } catch (err) {
      console.error("Failed to update volunteer active status:", err);
      onShowError?.("אירעה שגיאה. נסה שוב.");
    } finally {
      setIsProcessing(false);
    }
  };

  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="community-volunteers-mgmt">
      {!loading && !error ? (
        <section
          className="activities-mgmt-summary"
          aria-label="סיכום מתנדבים"
        >
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
            <span className="activities-mgmt-summary__icon">
              <Users size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {volunteerStats.total}
            </span>
            <span className="activities-mgmt-summary__label">סה״כ מתנדבים</span>
            <span className="activities-mgmt-summary__hint">
              כל המתנדבים במערכת
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--participants">
            <span className="activities-mgmt-summary__icon">
              <UserCheck size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {volunteerStats.active}
            </span>
            <span className="activities-mgmt-summary__label">
              מתנדבים פעילים
            </span>
            <span className="activities-mgmt-summary__hint">
              פעילים כרגע במערכת
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--open">
            <span className="activities-mgmt-summary__icon">
              <UserX size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {volunteerStats.inactive}
            </span>
            <span className="activities-mgmt-summary__label">לא פעילים</span>
            <span className="activities-mgmt-summary__hint">
              מתנדבים מושבתים כרגע
            </span>
          </div>
        </section>
      ) : null}

      <div className="admin-list-toolbar staff-form staff-list-filters">
        <div className="admin-list-toolbar__search">
          <label htmlFor="volunteers-mgmt-search">חיפוש</label>
          <input
            id="volunteers-mgmt-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם, טלפון או כתובת..."
          />
        </div>

        <div className="admin-list-toolbar__filters">
          <div>
            <label htmlFor="volunteers-mgmt-filter">סטטוס</label>
            <select
              id="volunteers-mgmt-filter"
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
            >
              <option value="all">כל המתנדבים</option>
              <option value="active">פעילים</option>
              <option value="inactive">לא פעילים</option>
            </select>
          </div>
        </div>

        <div className="admin-list-toolbar__page-size">
          <label htmlFor="volunteers-mgmt-page-size">מספר מתנדבים בעמוד</label>
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

      {error ? (
        <p className="staff-alert staff-alert--error">{error}</p>
      ) : null}

      {loading ? (
        <p className="activities-mgmt-loading">טוען מתנדבים...</p>
      ) : null}

      {!loading && !error ? (
        <div className="community-staff-request-list community-volunteers-mgmt__card">
        {filteredVolunteers.length === 0 ? (
          <CommunityStaffEmptyState
            icon={Users}
            message={
              volunteers.length === 0
                ? "אין נתונים להצגה כרגע"
                : "לא נמצאו תוצאות לפי החיפוש או הסינון"
            }
          />
        ) : (
          <ul className="community-staff-compact-list">
            {paginatedVolunteers.map((volunteer) => {
              const isActive = volunteer.is_active === true;

              return (
              <CommunityStaffCompactCard
                key={volunteer.id}
                name={volunteer.fullNameDisplay}
                phone={volunteer.phoneDisplay}
                inactive={!isActive}
                status={
                  <CommunityStaffActiveBadge isActive={isActive} />
                }
                viewLabel="צפייה"
                primaryLabel="עריכה"
                onPrimaryClick={() => onEditVolunteer(volunteer)}
                onViewDetails={() => onViewDetails(volunteer)}
                onDeactivate={
                  isActive
                    ? () => {
                        setPendingActionVolunteer(volunteer);
                        setPendingActionType("deactivate");
                      }
                    : undefined
                }
                onReactivate={
                  !isActive
                    ? () => {
                        setPendingActionVolunteer(volunteer);
                        setPendingActionType("reactivate");
                      }
                    : undefined
                }
                deactivateLabel="השבתה"
              />
              );
            })}
          </ul>
        )}
        </div>
      ) : null}

      {!loading && !error && filteredVolunteers.length > 0 ? (
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

      <CommunityStaffConfirmModal
        message={
          pendingActionVolunteer
            ? pendingActionType === "deactivate"
              ? "להשבית את המתנדב/ה?"
              : pendingActionType === "reactivate"
                ? "להפעיל את המתנדב/ה מחדש?"
                : null
            : null
        }
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setPendingActionVolunteer(null);
          setPendingActionType(null);
        }}
        confirming={isProcessing}
      />
    </div>
  );
}

export default VolunteersManagementTable;
