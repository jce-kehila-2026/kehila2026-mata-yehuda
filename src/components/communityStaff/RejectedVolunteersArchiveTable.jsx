import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive } from "lucide-react";
import {
  deleteVolunteerRequest,
  getRejectedVolunteerRequests,
  restoreVolunteerRequest,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "./CommunityStaffMessage";
import {
  CommunityStaffEmptyState,
  CommunityStaffStatusBadge,
} from "./CommunityStaffListUi.jsx";
import {
  AdminTableActions,
  AdminTableViewButton,
} from "../admin/AdminTableActions.jsx";
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

function RejectedVolunteersArchiveTable() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { message, showSuccess, showError, clearMessage } =
    useCommunityStaffMessage();

  const loadVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rejectedVolunteers = await getRejectedVolunteerRequests();
      setVolunteers(rejectedVolunteers);
    } catch (err) {
      console.error("Failed to load rejected volunteer requests:", err);
      setError("שגיאה בטעינת ארכיון בקשות ההתנדבות");
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

  const handleRestore = async (volunteerId) => {
    setIsRestoring(true);

    try {
      await restoreVolunteerRequest(volunteerId);
      setSelectedVolunteer(null);
      showSuccess("הבקשה שוחזרה לרשימת הבקשות הממתינות");
      await loadVolunteers();
    } catch (err) {
      console.error("Failed to restore volunteer request:", err);
      showError("אירעה שגיאה בשחזור הבקשה");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDelete = async (volunteerId) => {
    setIsDeleting(true);

    try {
      await deleteVolunteerRequest(volunteerId);
      setSelectedVolunteer(null);
      showSuccess("הבקשה נמחקה לצמיתות");
      await loadVolunteers();
    } catch (err) {
      console.error("Failed to delete volunteer request:", err);
      showError("אירעה שגיאה במחיקת הבקשה");
    } finally {
      setIsDeleting(false);
    }
  };

  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="community-volunteer-requests">
      <CommunityStaffMessage message={message} onDismiss={clearMessage} />

      {!loading && !error ? (
        <section
          className="activities-mgmt-summary"
          aria-label="סיכום ארכיון בקשות התנדבות"
        >
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
            <span className="activities-mgmt-summary__icon">
              <Archive size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {volunteers.length}
            </span>
            <span className="activities-mgmt-summary__label">
              בקשות שנדחו
            </span>
            <span className="activities-mgmt-summary__hint">
              בקשות התנדבות שהועברו לארכיון
            </span>
          </div>
        </section>
      ) : null}

      <div className="admin-list-toolbar staff-form staff-list-filters">
        <div className="admin-list-toolbar__search">
          <label htmlFor="rejected-volunteers-search">חיפוש</label>
          <input
            id="rejected-volunteers-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם, טלפון או סטטוס..."
          />
        </div>

        <div className="admin-list-toolbar__page-size">
          <label htmlFor="rejected-volunteers-page-size">
            מספר בקשות בעמוד
          </label>
          <select
            id="rejected-volunteers-page-size"
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
        <p className="activities-mgmt-loading">טוען ארכיון בקשות התנדבות...</p>
      ) : null}

      {!loading && !error ? (
        <div className="community-staff-request-list community-volunteer-requests__card">
          {filteredVolunteers.length === 0 ? (
            <CommunityStaffEmptyState
              icon={Archive}
              message={
                volunteers.length === 0
                  ? "אין בקשות שנדחו בארכיון"
                  : "לא נמצאו בקשות התואמות לחיפוש"
              }
            />
          ) : (
            <ul className="community-staff-compact-list">
              {paginatedVolunteers.map((volunteer) => (
                <li
                  key={volunteer.id}
                  className="community-staff-compact-card community-staff-compact-card--inactive"
                >
                  <div className="community-staff-compact-card__main">
                    <div className="community-staff-compact-card__identity">
                      <span className="community-staff-compact-card__name">
                        {volunteer.fullNameDisplay}
                      </span>
                      <span className="community-staff-compact-card__phone">
                        {volunteer.phone || "—"}
                      </span>
                    </div>
                    <div className="community-staff-compact-card__status-wrap">
                      <CommunityStaffStatusBadge status={volunteer.status} />
                    </div>
                  </div>

                  <div className="community-staff-compact-card__actions">
                    <AdminTableActions>
                      <AdminTableViewButton
                        onClick={() => setSelectedVolunteer(volunteer)}
                        label="צפייה"
                        disabled={isRestoring || isDeleting}
                      />
                    </AdminTableActions>
                  </div>
                </li>
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
        onRestore={handleRestore}
        isRestoring={isRestoring}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default RejectedVolunteersArchiveTable;
