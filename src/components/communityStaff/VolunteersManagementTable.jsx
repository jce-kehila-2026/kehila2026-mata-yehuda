import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllVolunteers,
  updateVolunteerActiveStatus,
} from "../../services/communityStaff/communityStaffService";
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
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";

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
  const [pendingDeactivateVolunteer, setPendingDeactivateVolunteer] =
    useState(null);
  const [deactivating, setDeactivating] = useState(false);

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

  const handleConfirmDeactivate = async () => {
    if (!pendingDeactivateVolunteer) {
      return;
    }

    setDeactivating(true);

    try {
      await updateVolunteerActiveStatus(pendingDeactivateVolunteer.id, false);
      onVolunteerUpdated?.({
        successMessage: "המתנדב הושבת בהצלחה",
      });
      setPendingDeactivateVolunteer(null);
      await loadVolunteers();
    } catch (err) {
      console.error("Failed to update volunteer active status:", err);
      onShowError?.("אירעה שגיאה. נסה שוב.");
    } finally {
      setDeactivating(false);
    }
  };

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
      <CommunityStaffStatusOverview
        items={buildActiveInactiveOverviewItems(
          volunteers,
          (volunteer) => volunteer.is_active === true
        )}
      />

      <CommunityStaffListToolbar
        searchId="volunteers-mgmt-search"
        searchValue={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        searchPlaceholder="חיפוש לפי שם, טלפון או כתובת..."
        filterId="volunteers-mgmt-filter"
        filterValue={activeFilter}
        onFilterChange={(event) => setActiveFilter(event.target.value)}
        filterLabel="סטטוס"
        filterOptions={[
          { value: "all", label: "כל המתנדבים" },
          { value: "active", label: "פעילים" },
          { value: "inactive", label: "לא פעילים" },
        ]}
        pageSizeId="volunteers-mgmt-page-size"
        pageSizeValue={pageSize}
        onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
      />

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
            {paginatedVolunteers.map((volunteer) => (
              <CommunityStaffCompactCard
                key={volunteer.id}
                name={volunteer.fullNameDisplay}
                phone={volunteer.phoneDisplay}
                status={
                  <CommunityStaffActiveBadge isActive={volunteer.is_active === true} />
                }
                viewLabel="צפייה"
                primaryLabel="עריכה"
                onPrimaryClick={() => onEditVolunteer(volunteer)}
                onViewDetails={() => onViewDetails(volunteer)}
                onDeactivate={() => setPendingDeactivateVolunteer(volunteer)}
                deactivateLabel="השבתה"
                deactivateDisabled={volunteer.is_active !== true}
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

      <CommunityStaffConfirmModal
        message={
          pendingDeactivateVolunteer ? "להשבית את המתנדב/ה?" : null
        }
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setPendingDeactivateVolunteer(null)}
        confirming={deactivating}
      />
    </div>
  );
}

export default VolunteersManagementTable;
