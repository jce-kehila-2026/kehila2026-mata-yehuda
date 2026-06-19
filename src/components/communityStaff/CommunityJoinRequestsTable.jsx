import { useEffect, useMemo, useState } from "react";
import { getPendingCommunityJoinRequests } from "../../services/communityStaff/communityStaffService";
import {
  ClipboardList,
  CommunityStaffCompactCard,
  CommunityStaffEmptyState,
  CommunityStaffListToolbar,
  CommunityStaffPagination,
  CommunityStaffStatusBadge,
  CommunityStaffStatusOverview,
  buildRequestStatusOverviewItems,
} from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

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

  if (loading) {
    return <p className="community-join-requests__loading">טוען בקשות הצטרפות...</p>;
  }

  if (error) {
    return <p className="community-join-requests__error">{error}</p>;
  }

  return (
    <div className="community-join-requests">
      <CommunityStaffStatusOverview
        items={buildRequestStatusOverviewItems(requests)}
      />

      <CommunityStaffListToolbar
        searchId="join-requests-search"
        searchValue={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        searchPlaceholder="חיפוש לפי שם, ת.ז., טלפון או שירות..."
        filterId="join-requests-filter"
        filterValue={serviceFilter}
        onFilterChange={(event) => setServiceFilter(event.target.value)}
        filterOptions={[
          { value: "all", label: "כל הבקשות" },
          { value: "with-other", label: "כולל שירות אחר" },
          { value: "without-other", label: "ללא שירות אחר" },
        ]}
        pageSizeId="join-requests-page-size"
        pageSizeValue={pageSize}
        onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
      />

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
                  status={<CommunityStaffStatusBadge status={request.status} />}
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

      {filteredRequests.length > 0 && (
        <CommunityStaffPagination
          currentPage={Math.min(currentPage, totalPages)}
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

export default CommunityJoinRequestsTable;
