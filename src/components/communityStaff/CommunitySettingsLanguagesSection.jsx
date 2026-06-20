import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllLanguages,
  setLanguageActive,
} from "../../services/communityStaff/communitySettingsService";
import CommunitySettingsItemCard from "./CommunitySettingsItemCard.jsx";
import LanguageFormModal from "./LanguageFormModal.jsx";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";
import {
  CommunityStaffEmptyState,
  CommunityStaffListToolbar,
  CommunityStaffPagination,
  CommunityStaffStatusOverview,
  buildActiveInactiveOverviewItems,
  Languages,
} from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

function matchesSearch(language, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  return String(language.name || "")
    .toLowerCase()
    .includes(searchTerm.trim().toLowerCase());
}

function matchesActiveFilter(language, activeFilter) {
  if (activeFilter === "all") {
    return true;
  }

  if (activeFilter === "active") {
    return language.is_active === true;
  }

  if (activeFilter === "inactive") {
    return language.is_active !== true;
  }

  return true;
}

function CommunitySettingsLanguagesSection({ refreshKey = 0, onShowSuccess, onShowError }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [pendingToggleLanguage, setPendingToggleLanguage] = useState(null);
  const [toggling, setToggling] = useState(false);

  const loadLanguages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllLanguages();
      setLanguages(data);
    } catch (loadError) {
      console.error("Failed to load languages:", loadError);
      setError("שגיאה בטעינת השפות");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages, refreshKey]);

  const filteredLanguages = useMemo(() => {
    return languages.filter(
      (language) =>
        matchesSearch(language, searchTerm) &&
        matchesActiveFilter(language, activeFilter)
    );
  }, [languages, searchTerm, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLanguages.length / pageSize));

  const paginatedLanguages = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return filteredLanguages.slice(startIndex, startIndex + pageSize);
  }, [filteredLanguages, currentPage, pageSize, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleConfirmToggle = async () => {
    if (!pendingToggleLanguage) {
      return;
    }

    setToggling(true);
    const nextActive = pendingToggleLanguage.is_active !== true;

    try {
      await setLanguageActive(pendingToggleLanguage.id, nextActive);
      onShowSuccess?.(
        nextActive ? "השפה הופעלה בהצלחה" : "השפה הושבתה בהצלחה"
      );
      setPendingToggleLanguage(null);
      await loadLanguages();
    } catch (toggleError) {
      console.error("Failed to toggle language status:", toggleError);
      onShowError?.("אירעה שגיאה בעדכון סטטוס השפה. נסה שוב.");
    } finally {
      setToggling(false);
    }
  };

  const toggleConfirmMessage = pendingToggleLanguage
    ? pendingToggleLanguage.is_active
      ? `להשבית את השפה "${pendingToggleLanguage.name}"?`
      : `להפעיל את השפה "${pendingToggleLanguage.name}"?`
    : null;

  return (
    <section className="community-settings-section" aria-labelledby="community-settings-languages-title">
      <div className="community-settings-section__header">
        <h2 id="community-settings-languages-title" className="community-settings-section__title">
          שפות
        </h2>
        <button
          type="button"
          className="community-staff-page-header__action community-settings-section__action"
          onClick={() => {
            setSelectedLanguage(null);
            setShowFormModal(true);
          }}
        >
          הוספת שפה
        </button>
      </div>

      {loading ? (
        <p className="community-settings-section__loading">טוען שפות...</p>
      ) : error ? (
        <p className="community-settings-section__error" role="alert">
          {error}
        </p>
      ) : (
        <>
          <CommunityStaffStatusOverview
            items={buildActiveInactiveOverviewItems(
              languages,
              (language) => language.is_active === true
            )}
          />

          <CommunityStaffListToolbar
            searchId="community-settings-languages-search"
            searchValue={searchTerm}
            onSearchChange={(event) => setSearchTerm(event.target.value)}
            searchPlaceholder="חיפוש לפי שם שפה..."
            filterId="community-settings-languages-filter"
            filterValue={activeFilter}
            onFilterChange={(event) => setActiveFilter(event.target.value)}
            filterLabel="סטטוס"
            filterOptions={[
              { value: "all", label: "כל השפות" },
              { value: "active", label: "פעילות" },
              { value: "inactive", label: "לא פעילות" },
            ]}
            pageSizeId="community-settings-languages-page-size"
            pageSizeValue={pageSize}
            onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />

          <div className="community-staff-request-list community-settings-section__list">
            {filteredLanguages.length === 0 ? (
              <CommunityStaffEmptyState
                icon={Languages}
                message={
                  languages.length === 0
                    ? "אין שפות להצגה כרגע"
                    : "לא נמצאו תוצאות לפי החיפוש או הסינון"
                }
              />
            ) : (
              <ul className="community-staff-compact-list">
                {paginatedLanguages.map((language) => (
                  <CommunitySettingsItemCard
                    key={language.id}
                    title={language.name}
                    isActive={language.is_active === true}
                    onEdit={() => {
                      setSelectedLanguage(language);
                      setShowFormModal(true);
                    }}
                    onToggleActive={() => setPendingToggleLanguage(language)}
                    toggling={toggling}
                  />
                ))}
              </ul>
            )}
          </div>

          {filteredLanguages.length > 0 && (
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

      <LanguageFormModal
        open={showFormModal}
        language={selectedLanguage}
        onClose={() => {
          setShowFormModal(false);
          setSelectedLanguage(null);
        }}
        onSaved={() => {
          setShowFormModal(false);
          setSelectedLanguage(null);
          onShowSuccess?.(
            selectedLanguage ? "השפה עודכנה בהצלחה" : "השפה נוספה בהצלחה"
          );
          loadLanguages();
        }}
      />

      <CommunityStaffConfirmModal
        message={toggleConfirmMessage}
        onConfirm={handleConfirmToggle}
        onCancel={() => setPendingToggleLanguage(null)}
        confirming={toggling}
        confirmLabel={pendingToggleLanguage?.is_active ? "השבתה" : "הפעלה"}
      />
    </section>
  );
}

export default CommunitySettingsLanguagesSection;
