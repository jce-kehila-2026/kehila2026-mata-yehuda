import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllHelpTypes,
  setHelpTypeActive,
} from "../../services/communityStaff/communitySettingsService";
import CommunitySettingsItemCard from "./CommunitySettingsItemCard.jsx";
import HelpTypeFormModal from "./HelpTypeFormModal.jsx";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";
import {
  CommunityStaffEmptyState,
  CommunityStaffListToolbar,
  CommunityStaffPagination,
  CommunityStaffStatusOverview,
  buildActiveInactiveOverviewItems,
  ClipboardList,
} from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

function matchesSearch(helpType, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchableValues = [helpType.help_name, helpType.description];

  return searchableValues.some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalizedSearch)
  );
}

function matchesActiveFilter(helpType, activeFilter) {
  if (activeFilter === "all") {
    return true;
  }

  if (activeFilter === "active") {
    return helpType.is_active === true;
  }

  if (activeFilter === "inactive") {
    return helpType.is_active !== true;
  }

  return true;
}

function CommunitySettingsHelpTypesSection({ refreshKey = 0, onShowSuccess, onShowError }) {
  const [helpTypes, setHelpTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedHelpType, setSelectedHelpType] = useState(null);
  const [pendingToggleHelpType, setPendingToggleHelpType] = useState(null);
  const [toggling, setToggling] = useState(false);

  const loadHelpTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllHelpTypes();
      setHelpTypes(data);
    } catch (loadError) {
      console.error("Failed to load help types:", loadError);
      setError("שגיאה בטעינת סוגי העזרה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHelpTypes();
  }, [loadHelpTypes, refreshKey]);

  const filteredHelpTypes = useMemo(() => {
    return helpTypes.filter(
      (helpType) =>
        matchesSearch(helpType, searchTerm) &&
        matchesActiveFilter(helpType, activeFilter)
    );
  }, [helpTypes, searchTerm, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHelpTypes.length / pageSize));

  const paginatedHelpTypes = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return filteredHelpTypes.slice(startIndex, startIndex + pageSize);
  }, [filteredHelpTypes, currentPage, pageSize, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleConfirmToggle = async () => {
    if (!pendingToggleHelpType) {
      return;
    }

    setToggling(true);
    const nextActive = pendingToggleHelpType.is_active !== true;

    try {
      await setHelpTypeActive(pendingToggleHelpType.id, nextActive);
      onShowSuccess?.(
        nextActive
          ? "סוג העזרה הופעל בהצלחה"
          : "סוג העזרה הושבת בהצלחה"
      );
      setPendingToggleHelpType(null);
      await loadHelpTypes();
    } catch (toggleError) {
      console.error("Failed to toggle help type status:", toggleError);
      onShowError?.("אירעה שגיאה בעדכון סטטוס סוג העזרה. נסה שוב.");
    } finally {
      setToggling(false);
    }
  };

  const toggleConfirmMessage = pendingToggleHelpType
    ? pendingToggleHelpType.is_active
      ? `להשבית את סוג העזרה "${pendingToggleHelpType.help_name}"?`
      : `להפעיל את סוג העזרה "${pendingToggleHelpType.help_name}"?`
    : null;

  return (
    <section className="community-settings-section" aria-labelledby="community-settings-help-types-title">
      <div className="community-settings-section__header">
        <h2 id="community-settings-help-types-title" className="community-settings-section__title">
          סוגי עזרה
        </h2>
        <button
          type="button"
          className="community-staff-page-header__action community-settings-section__action"
          onClick={() => {
            setSelectedHelpType(null);
            setShowFormModal(true);
          }}
        >
          הוספת סוג עזרה
        </button>
      </div>

      {loading ? (
        <p className="community-settings-section__loading">טוען סוגי עזרה...</p>
      ) : error ? (
        <p className="community-settings-section__error" role="alert">
          {error}
        </p>
      ) : (
        <>
          <CommunityStaffStatusOverview
            items={buildActiveInactiveOverviewItems(
              helpTypes,
              (helpType) => helpType.is_active === true
            )}
          />

          <CommunityStaffListToolbar
            searchId="community-settings-help-types-search"
            searchValue={searchTerm}
            onSearchChange={(event) => setSearchTerm(event.target.value)}
            searchPlaceholder="חיפוש לפי שם או תיאור..."
            filterId="community-settings-help-types-filter"
            filterValue={activeFilter}
            onFilterChange={(event) => setActiveFilter(event.target.value)}
            filterLabel="סטטוס"
            filterOptions={[
              { value: "all", label: "כל סוגי העזרה" },
              { value: "active", label: "פעילים" },
              { value: "inactive", label: "לא פעילים" },
            ]}
            pageSizeId="community-settings-help-types-page-size"
            pageSizeValue={pageSize}
            onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />

          <div className="community-staff-request-list community-settings-section__list">
            {filteredHelpTypes.length === 0 ? (
              <CommunityStaffEmptyState
                icon={ClipboardList}
                message={
                  helpTypes.length === 0
                    ? "אין סוגי עזרה להצגה כרגע"
                    : "לא נמצאו תוצאות לפי החיפוש או הסינון"
                }
              />
            ) : (
              <ul className="community-staff-compact-list">
                {paginatedHelpTypes.map((helpType) => (
                  <CommunitySettingsItemCard
                    key={helpType.id}
                    title={helpType.help_name}
                    subtitle={helpType.description || "—"}
                    isActive={helpType.is_active === true}
                    onEdit={() => {
                      setSelectedHelpType(helpType);
                      setShowFormModal(true);
                    }}
                    onToggleActive={() => setPendingToggleHelpType(helpType)}
                    toggling={toggling}
                  />
                ))}
              </ul>
            )}
          </div>

          {filteredHelpTypes.length > 0 && (
            <CommunityStaffPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
              onNext={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            />
          )}
        </>
      )}

      <HelpTypeFormModal
        open={showFormModal}
        helpType={selectedHelpType}
        onClose={() => {
          setShowFormModal(false);
          setSelectedHelpType(null);
        }}
        onSaved={() => {
          setShowFormModal(false);
          setSelectedHelpType(null);
          onShowSuccess?.(
            selectedHelpType
              ? "סוג העזרה עודכן בהצלחה"
              : "סוג העזרה נוסף בהצלחה"
          );
          loadHelpTypes();
        }}
      />

      <CommunityStaffConfirmModal
        message={toggleConfirmMessage}
        onConfirm={handleConfirmToggle}
        onCancel={() => setPendingToggleHelpType(null)}
        confirming={toggling}
        confirmLabel={pendingToggleHelpType?.is_active ? "השבתה" : "הפעלה"}
      />
    </section>
  );
}

export default CommunitySettingsHelpTypesSection;
