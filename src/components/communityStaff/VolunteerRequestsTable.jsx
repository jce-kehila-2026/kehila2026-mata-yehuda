import { useCallback, useEffect, useMemo, useState } from "react";
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
  CommunityStaffListToolbar,
  CommunityStaffPagination,
  CommunityStaffStatusBadge,
  CommunityStaffStatusOverview,
  Users,
  buildRequestStatusOverviewItems,
} from "./CommunityStaffListUi.jsx";
import VolunteerRequestDetailsModal from "./VolunteerRequestDetailsModal.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

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
  const { message, showSuccess, showError, clearMessage } = useCommunityStaffMessage();

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
    return volunteers.filter((volunteer) => matchesSearch(volunteer, searchTerm));
  }, [volunteers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredVolunteers.length / pageSize));

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

  if (loading) {
    return (
      <p className="community-volunteer-requests__loading">
        טוען בקשות התנדבות...
      </p>
    );
  }

  if (error) {
    return <p className="community-volunteer-requests__error">{error}</p>;
  }

  return (
    <div className="community-volunteer-requests">
      <CommunityStaffStatusOverview
        items={buildRequestStatusOverviewItems(volunteers)}
      />

      <CommunityStaffMessage message={message} onDismiss={clearMessage} />

      <CommunityStaffListToolbar
        searchId="volunteer-requests-search"
        searchValue={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        searchPlaceholder="חיפוש לפי שם, טלפון או סטטוס..."
        pageSizeId="volunteer-requests-page-size"
        pageSizeValue={pageSize}
        onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        showFilter={false}
      />

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
                status={<CommunityStaffStatusBadge status={volunteer.status} />}
                viewLabel="צפייה"
                primaryLabel="אישור"
                onPrimaryClick={() => setSelectedVolunteer(volunteer)}
                onViewDetails={() => setSelectedVolunteer(volunteer)}
                primaryDisabled={isApproving}
              />
            ))}
          </ul>
        )}
      </div>

      {filteredVolunteers.length > 0 && (
        <CommunityStaffPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNext={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
        />
      )}

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
