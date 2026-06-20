import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommunityStaffCompactCard,
  CommunityStaffActiveBadge,
  CommunityStaffEmptyState,
  CommunityStaffListToolbar,
  CommunityStaffPagination,
  CommunityStaffStatusOverview,
  Users,
  buildActiveInactiveOverviewItems,
} from "./CommunityStaffListUi.jsx";
import {
  getCommunityMembers,
  updateCommunityMemberSubscriptionStatus,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

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
    member.status,
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
  onMemberUpdated,
  onShowError,
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeactivateMember, setPendingDeactivateMember] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

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

  const handleConfirmDeactivate = async () => {
    if (!pendingDeactivateMember) {
      return;
    }

    setDeactivating(true);

    try {
      await updateCommunityMemberSubscriptionStatus(
        pendingDeactivateMember.id,
        "inactive"
      );
      onMemberUpdated?.({
        successMessage: "חברות המשתתף/ת הושבתה בהצלחה",
      });
      setPendingDeactivateMember(null);
      await loadMembers();
    } catch (err) {
      console.error("Failed to update member subscription status:", err);
      onShowError?.("אירעה שגיאה. נסה שוב.");
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return <p className="community-members__loading">טוען חברי קהילה...</p>;
  }

  if (error) {
    return <p className="community-members__error">{error}</p>;
  }

  return (
    <div className="community-members">
      <CommunityStaffStatusOverview
        items={buildActiveInactiveOverviewItems(
          members,
          (member) => member.status === "active"
        )}
      />

      <CommunityStaffListToolbar
        searchId="community-members-search"
        searchValue={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        searchPlaceholder="חיפוש לפי שם, ת.ז., טלפון, שירות או שפה..."
        filterId="community-members-filter"
        filterValue={statusFilter}
        onFilterChange={(event) => setStatusFilter(event.target.value)}
        filterLabel="סטטוס"
        filterOptions={[
          { value: "all", label: "הכל" },
          { value: "active", label: "פעיל" },
          { value: "inactive", label: "לא פעיל" },
        ]}
        pageSizeId="community-members-page-size"
        pageSizeValue={pageSize}
        onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
      />

      <div className="community-staff-request-list community-members__card">
        {filteredMembers.length === 0 ? (
          <CommunityStaffEmptyState
            icon={Users}
            message={
              members.length === 0
                ? "אין נתונים להצגה כרגע"
                : "לא נמצאו תוצאות לפי החיפוש או הסינון"
            }
          />
        ) : (
          <ul className="community-staff-compact-list">
            {paginatedMembers.map((member) => (
              <CommunityStaffCompactCard
                key={member.id}
                name={member.fullNameDisplay}
                phone={member.phone}
                status={
                  <CommunityStaffActiveBadge isActive={member.status === "active"} />
                }
                viewLabel="צפייה"
                primaryLabel="עריכה"
                onPrimaryClick={() => onEditMember(member)}
                onViewDetails={() => onViewDetails(member)}
                onDeactivate={() => setPendingDeactivateMember(member)}
                deactivateLabel="השבתה"
                deactivateDisabled={member.status !== "active"}
              />
            ))}
          </ul>
        )}
      </div>

      {filteredMembers.length > 0 && (
        <CommunityStaffPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNext={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
        />
      )}

      <CommunityStaffConfirmModal
        message={
          pendingDeactivateMember
            ? "להשבית את חברות המשתתף/ת בקהילה?"
            : null
        }
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setPendingDeactivateMember(null)}
        confirming={deactivating}
      />
    </div>
  );
}

export default CommunityMembersTable;
