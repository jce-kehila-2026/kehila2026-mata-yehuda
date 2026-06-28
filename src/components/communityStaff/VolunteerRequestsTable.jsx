import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Clock, PlusCircle } from "lucide-react";
import {
  approveVolunteer,
  getPendingVolunteerRequests,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "./CommunityStaffMessage";
import {
  CommunityStaffCompactCard,
  CommunityStaffEmptyState,
  CommunityStaffStatusBadge,
  getCommunityStaffStatusVariant,
} from "./CommunityStaffListUi.jsx";
import VolunteerRequestDetailsModal from "./VolunteerRequestDetailsModal.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function matchesSearch(volunteer, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchableValues = [
    volunteer.fullNameDisplay,
    volunteer.phone,
    volunteer.status,
  ];

  return searchableValues.some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedSearch)
  );
}

function VolunteerRequestsTable() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const { message, showSuccess, showError, clearMessage } =
    useCommunityStaffMessage();

  const loadVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pendingVolunteers = await getPendingVolunteerRequests();
      setVolunteers(pendingVolunteers);
    } catch (err) {
      console.error("Failed to load volunteer requests:", err);
      setError("שגיאה בטעינת בקשות ההתנדבות");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) =>
      matchesSearch(volunteer, searchTerm)
    );
  }, [volunteers, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVolunteers.length / pageSize)
  );

  const paginatedVolunteers = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return filteredVolunteers.slice(startIndex, startIndex + pageSize);
  }, [filteredVolunteers, currentPage, pageSize, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const volunteerStats = useMemo(() => {
    let pending = 0;
    let withOtherService = 0;

    volunteers.forEach((volunteer) => {
      if (getCommunityStaffStatusVariant(volunteer.status) === "pending") {
        pending += 1;
      }

      if (volunteer.otherService) {
        withOtherService += 1;
      }
    });

    return { total: volunteers.length, pending, withOtherService };
  }, [volunteers]);

  const handleApprove = async (volunteerId) => {
    setIsApproving(true);

    try {
      await approveVolunteer(volunteerId);
      setSelectedVolunteer(null);
      showSuccess("המתנדב אושר בהצלחה");
      await loadVolunteers();
    } catch (err) {
      console.error("Failed to approve volunteer:", err);
      showError("אירעה שגיאה באישור המתנדב");
    } finally {
      setIsApproving(false);
    }
  };

  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="community-volunteer-requests">
      <CommunityStaffMessage message={message} onDismiss={clearMessage} />

      {!loading && !error ? (
        <section
          className="activities-mgmt-summary"
          aria-label="סיכום בקשות התנדבות"
        >
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
            <span className="activities-mgmt-summary__icon">
              <Users size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {volunteerStats.total}
            </span>
            <span className="activities-mgmt-summary__label">סה״כ בקשות</span>
            <span className="activities-mgmt-summary__hint">
              כל בקשות ההתנדבות שהתקבלו
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--open">
            <span className="activities-mgmt-summary__icon">
              <Clock size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {volunteerStats.pending}
            </span>
            <span className="activities-mgmt-summary__label">
              ממתינות לאישור
            </span>
            <span className="activities-mgmt-summary__hint">
              מתנדבים שטרם אושרו
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--participants">
            <span className="activities-mgmt-summary__icon">
              <PlusCircle size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {volunteerStats.withOtherService}
            </span>
            <span className="activities-mgmt-summary__label">
              כולל שירות אחר
            </span>
            <span className="activities-mgmt-summary__hint">
              בקשות עם שירות נוסף
            </span>
          </div>
        </section>
      ) : null}

      <div className="admin-list-toolbar staff-form staff-list-filters">
        <div className="admin-list-toolbar__search">
          <label htmlFor="volunteer-requests-search">חיפוש</label>
          <input
            id="volunteer-requests-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם, טלפון או סטטוס..."
          />
        </div>

        <div className="admin-list-toolbar__page-size">
          <label htmlFor="volunteer-requests-page-size">
            מספר בקשות בעמוד
          </label>
          <select
            id="volunteer-requests-page-size"
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
        <p className="activities-mgmt-loading">טוען בקשות התנדבות...</p>
      ) : null}

      {!loading && !error ? (
        <div className="community-staff-request-list community-volunteer-requests__card">
          {filteredVolunteers.length === 0 ? (
            <CommunityStaffEmptyState
              icon={Users}
              message={
                volunteers.length === 0
                  ? "אין בקשות ממתינות כרגע"
                  : "לא נמצאו בקשות התואמות לחיפוש"
              }
            />
          ) : (
            <ul className="community-staff-compact-list">
              {paginatedVolunteers.map((volunteer) => (
                <CommunityStaffCompactCard
                  key={volunteer.id}
                  name={volunteer.fullNameDisplay}
                  phone={volunteer.phone || "—"}
                  status={
                    <CommunityStaffStatusBadge status={volunteer.status} />
                  }
                  primaryLabel="אישור"
                  viewLabel="צפייה"
                  onPrimaryClick={() => setSelectedVolunteer(volunteer)}
                  onViewDetails={() => setSelectedVolunteer(volunteer)}
                  primaryDisabled={isApproving}
                />
              ))}
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

      <VolunteerRequestDetailsModal
        volunteer={selectedVolunteer}
        onClose={() => setSelectedVolunteer(null)}
        onApprove={handleApprove}
        isApproving={isApproving}
      />
    </div>
  );
}

export default VolunteerRequestsTable;
