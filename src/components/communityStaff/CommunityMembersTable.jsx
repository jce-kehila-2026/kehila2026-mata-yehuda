import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, UserCheck, UserX } from "lucide-react";
import {
  CommunityStaffCompactCard,
  CommunityStaffActiveBadge,
  CommunityStaffEmptyState,
} from "./CommunityStaffListUi.jsx";
import {
  getCommunityMembers,
  updateCommunityMemberSubscriptionStatus,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

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

  const memberStats = useMemo(() => {
    let active = 0;

    members.forEach((member) => {
      if (member.status === "active") {
        active += 1;
      }
    });

    return {
      total: members.length,
      active,
      inactive: members.length - active,
    };
  }, [members]);

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

  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="community-members">
      {!loading && !error ? (
        <section
          className="activities-mgmt-summary"
          aria-label="סיכום חברי קהילה"
        >
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
            <span className="activities-mgmt-summary__icon">
              <Users size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {memberStats.total}
            </span>
            <span className="activities-mgmt-summary__label">סה״כ חברים</span>
            <span className="activities-mgmt-summary__hint">
              כל חברי הקהילה במערכת
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--participants">
            <span className="activities-mgmt-summary__icon">
              <UserCheck size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {memberStats.active}
            </span>
            <span className="activities-mgmt-summary__label">חברים פעילים</span>
            <span className="activities-mgmt-summary__hint">
              חברות פעילה בקהילה
            </span>
          </div>
          <div className="activities-mgmt-summary__card activities-mgmt-summary__card--open">
            <span className="activities-mgmt-summary__icon">
              <UserX size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="activities-mgmt-summary__value">
              {memberStats.inactive}
            </span>
            <span className="activities-mgmt-summary__label">לא פעילים</span>
            <span className="activities-mgmt-summary__hint">
              חברות מושבתת כרגע
            </span>
          </div>
        </section>
      ) : null}

      <div className="admin-list-toolbar staff-form staff-list-filters">
        <div className="admin-list-toolbar__search">
          <label htmlFor="community-members-search">חיפוש</label>
          <input
            id="community-members-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="חיפוש לפי שם, ת.ז., טלפון, שירות או שפה..."
          />
        </div>

        <div className="admin-list-toolbar__filters">
          <div>
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
        </div>

        <div className="admin-list-toolbar__page-size">
          <label htmlFor="community-members-page-size">מספר חברים בעמוד</label>
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

      {error ? (
        <p className="staff-alert staff-alert--error">{error}</p>
      ) : null}

      {loading ? (
        <p className="activities-mgmt-loading">טוען חברי קהילה...</p>
      ) : null}

      {!loading && !error ? (
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
                    <CommunityStaffActiveBadge
                      isActive={member.status === "active"}
                    />
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
      ) : null}

      {!loading && !error && filteredMembers.length > 0 ? (
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
