import { useEffect, useMemo, useState } from "react";
import { getPendingCommunityJoinRequests } from "../../services/communityStaffService";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

function getParticipantFullName(participant) {
  if (!participant) return "—";

  const firstName = participant.first_name || "";
  const lastName = participant.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "—";
}

function formatDate(timestamp) {
  if (!timestamp) return "—";

  const date =
    typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : timestamp instanceof Date
        ? timestamp
        : null;

  if (!date) return "—";

  return date.toLocaleString("he-IL");
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

function CommunityJoinRequestsTable({ onCompleteRegistration }) {
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
  }, []);

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

  if (loading) {
    return <p className="community-join-requests__loading">טוען בקשות הצטרפות...</p>;
  }

  if (error) {
    return <p className="community-join-requests__error">{error}</p>;
  }

  return (
    <div className="community-join-requests">
      <div className="community-join-requests__top-row">
        <span className="community-join-requests__badge">
          בקשות ממתינות {requests.length}
        </span>
      </div>

      <div className="community-join-requests__toolbar">
        <div className="community-join-requests__search">
          <label htmlFor="join-requests-search">חיפוש</label>
          <input
            id="join-requests-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם, ת.ז., טלפון או שירות..."
          />
        </div>

        <div className="community-join-requests__filter">
          <label htmlFor="join-requests-filter">סינון</label>
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

        <div className="community-join-requests__page-size">
          <label htmlFor="join-requests-page-size">שורות בעמוד</label>
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

      <div className="community-join-requests__card">
        {filteredRequests.length === 0 ? (
          <p className="community-join-requests__empty">
            {requests.length === 0
              ? "אין בקשות הצטרפות ממתינות"
              : "לא נמצאו בקשות התואמות לחיפוש"}
          </p>
        ) : (
          <div className="community-join-requests__table-wrapper">
            <table className="community-join-requests__table">
              <thead>
                <tr>
                  <th>שם מלא</th>
                  <th>תעודת זהות</th>
                  <th>טלפון</th>
                  <th>כתובת</th>
                  <th>שירותים מבוקשים</th>
                  <th>שפות</th>
                  <th>סטטוס</th>
                  <th>תאריך הגשה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => {
                  const participant = request.participant;

                  return (
                    <tr key={request.id} className="community-join-requests__row">
                      <td data-label="שם מלא">
                        {getParticipantFullName(participant)}
                      </td>
                      <td data-label="תעודת זהות">
                        {participant?.id_number || "—"}
                      </td>
                      <td data-label="טלפון">{participant?.phone || "—"}</td>
                      <td data-label="כתובת">{participant?.address || "—"}</td>
                      <td data-label="שירותים מבוקשים">
                        {getServicesDisplay(request)}
                      </td>
                      <td data-label="שפות">
                        {request.languagesDisplay || "—"}
                      </td>
                      <td data-label="סטטוס">
                        <span className="community-join-requests__status">
                          {request.status || "—"}
                        </span>
                      </td>
                      <td data-label="תאריך הגשה">
                        {formatDate(request.createdAt)}
                      </td>
                      <td data-label="פעולות">
                        <button
                          type="button"
                          className="community-join-requests__complete-btn"
                          onClick={() => onCompleteRegistration?.(request)}
                        >
                          השלמת רישום
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredRequests.length > 0 && (
        <div className="community-join-requests__pagination">
          עמוד {Math.min(currentPage, totalPages)} מתוך {totalPages}
          {" · "}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage <= 1}
          >
            הקודם
          </button>
          {" "}
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage >= totalPages}
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}

export default CommunityJoinRequestsTable;
