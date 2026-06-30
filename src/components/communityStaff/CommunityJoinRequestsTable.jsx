import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Clock, PlusCircle } from "lucide-react";
import { getPendingCommunityJoinRequests } from "../../services/communityStaff/communityStaffService";
import {
  CommunityStaffCompactCard,
  CommunityStaffEmptyState,
  CommunityStaffStatusBadge,
  getCommunityStaffStatusVariant,
} from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function getParticipantFullName(participant) {
  if (!participant) return "—";

  const firstName = participant.first_name || "";
  const lastName = participant.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "—";
}

function getServicesDisplay(request) {
  const requestedServices = request.requestedServicesDisplay || "—";
  if (request.otherService && requestedServices !== "—") {
    return `${requestedServices}, ${request.otherService}`;
  }
  return request.otherService || requestedServices;
}

function matchesSearch(request, searchTerm) {
  if (!searchTerm) return true;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const participant = request.participant;
  const searchableValues = [
    getParticipantFullName(participant),
    participant?.id_number,
    participant?.phone,
    participant?.address,
    getServicesDisplay(request),
    request.languagesDisplay,
    request.status,
  ];

  return searchableValues.some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedSearch)
  );
}

function CommunityJoinRequestsTable({
  onCompleteRegistration,
  onViewDetails,
  refreshKey = 0,
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      setLoading(true);
      setError(null);

      try {
        const pendingRequests = await getPendingCommunityJoinRequests();

        if (isMounted) {
          setRequests(pendingRequests);
        }
      } catch (err) {
        console.error("Failed to load community join requests:", err);
        if (isMounted) {
          setError("שגיאה בטעינת בקשות ההצטרפות");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (!matchesSearch(request, searchTerm)) {
        return false;
      }

      if (serviceFilter === "with-other" && !request.otherService) {
        return false;
      }

      if (serviceFilter === "without-other" && request.otherService) {
        return false;
      }

      return true;
    });
  }, [requests, searchTerm, serviceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));

  const paginatedRequests = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  }, [filteredRequests, currentPage, pageSize, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, serviceFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const requestStats = useMemo(() => {
    let pending = 0;
    let withOtherService = 0;

    requests.forEach((request) => {
      if (getCommunityStaffStatusVariant(request.status) === "pending") {
        pending += 1;
      }

      if (request.otherService) {
        withOtherService += 1;
      }
    });

    return { total: requests.length, pending, withOtherService };
  }, [requests]);

  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="community-join-requests">
      {!loading && !error ? (
        <section
          className="activities-mgmt-summary"
          aria-label="סיכום בקשות הצטרפות"
        >
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
            <span className="activities-mgmt-summary__icon">
              <ClipboardList size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {requestStats.total}
            </span>
            <span className="activities-mgmt-summary__label">סה״כ בקשות</span>
            <span className="activities-mgmt-summary__hint">
              כל הבקשות שהתקבלו
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--open">
            <span className="activities-mgmt-summary__icon">
              <Clock size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {requestStats.pending}
            </span>
            <span className="activities-mgmt-summary__label">
              ממתינות לטיפול
            </span>
            <span className="activities-mgmt-summary__hint">
              בקשות שטרם הושלמו
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--participants">
            <span className="activities-mgmt-summary__icon">
              <PlusCircle size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {requestStats.withOtherService}
            </span>
            <span className="activities-mgmt-summary__label">
              כולל שירות אחר
            </span>
            <span className="activities-mgmt-summary__hint">
              בקשות עם בקשה מיוחדת
            </span>
          </div>
        </section>
      ) : null}

      <div className="admin-list-toolbar staff-form staff-list-filters">
        <div className="admin-list-toolbar__search">
          <label htmlFor="join-requests-search">חיפוש</label>
          <input
            id="join-requests-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם, ת.ז., טלפון או שירות..."
          />
        </div>

        <div className="admin-list-toolbar__filters">
          <div>
            <label htmlFor="join-requests-filter">סינון שירות</label>
            <select
              id="join-requests-filter"
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
            >
              <option value="all">כל הבקשות</option>
              <option value="with-other">כולל שירות אחר</option>
              <option value="without-other">ללא שירות אחר</option>
            </select>
          </div>
        </div>

        <div className="admin-list-toolbar__page-size">
          <label htmlFor="join-requests-page-size">מספר בקשות בעמוד</label>
          <select
            id="join-requests-page-size"
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
        <p className="activities-mgmt-loading">טוען בקשות הצטרפות...</p>
      ) : null}

      {!loading && !error ? (
        <div className="community-staff-request-list community-join-requests__card">
          {filteredRequests.length === 0 ? (
            <CommunityStaffEmptyState
              icon={ClipboardList}
              message={
                requests.length === 0
                  ? "אין בקשות ממתינות כרגע"
                  : "לא נמצאו בקשות התואמות לחיפוש"
              }
            />
          ) : (
            <ul className="community-staff-compact-list">
              {paginatedRequests.map((request) => {
                const participant = request.participant;

                return (
                  <CommunityStaffCompactCard
                    key={request.id}
                    name={getParticipantFullName(participant)}
                    phone={participant?.phone || "—"}
                    status={
                      <CommunityStaffStatusBadge status={request.status} />
                    }
                    primaryLabel="השלמת רישום"
                    viewLabel="צפייה"
                    onPrimaryClick={() => onCompleteRegistration?.(request)}
                    onViewDetails={() => onViewDetails?.(request)}
                  />
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {!loading && !error && filteredRequests.length > 0 ? (
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

export default CommunityJoinRequestsTable;
