import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllLanguages,
  setLanguageActive,
} from "../../services/communityStaff/communitySettingsService";
import CommunitySettingsItemCard from "./CommunitySettingsItemCard.jsx";
import LanguageFormModal from "./LanguageFormModal.jsx";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";
import { Languages, CheckCircle2, XCircle } from "lucide-react";
import { CommunityStaffEmptyState } from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

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

  const languageStats = useMemo(() => {
    let active = 0;

    languages.forEach((language) => {
      if (language.is_active === true) {
        active += 1;
      }
    });

    return {
      total: languages.length,
      active,
      inactive: languages.length - active,
    };
  }, [languages]);

  const safePage = Math.min(currentPage, totalPages);

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
          <section
            className="activities-mgmt-summary"
            aria-label="סיכום שפות"
          >
            <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
              <span className="activities-mgmt-summary__icon">
                <Languages size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="activities-mgmt-summary__value">
                {languageStats.total}
              </span>
              <span className="activities-mgmt-summary__label">סה״כ שפות</span>
              <span className="activities-mgmt-summary__hint">
                כל השפות במערכת
              </span>
            </div>
            <div className="activities-mgmt-summary__card activities-mgmt-summary__card--participants">
              <span className="activities-mgmt-summary__icon">
                <CheckCircle2 size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="activities-mgmt-summary__value">
                {languageStats.active}
              </span>
              <span className="activities-mgmt-summary__label">פעילות</span>
              <span className="activities-mgmt-summary__hint">
                שפות זמינות לשימוש
              </span>
            </div>
            <div className="activities-mgmt-summary__card activities-mgmt-summary__card--open">
              <span className="activities-mgmt-summary__icon">
                <XCircle size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="activities-mgmt-summary__value">
                {languageStats.inactive}
              </span>
              <span className="activities-mgmt-summary__label">לא פעילות</span>
              <span className="activities-mgmt-summary__hint">
                שפות מושבתות כרגע
              </span>
            </div>
          </section>

          <div className="admin-list-toolbar staff-form staff-list-filters">
            <div className="admin-list-toolbar__search">
              <label htmlFor="community-settings-languages-search">חיפוש</label>
              <input
                id="community-settings-languages-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="חיפוש לפי שם שפה..."
              />
            </div>

            <div className="admin-list-toolbar__filters">
              <div>
                <label htmlFor="community-settings-languages-filter">סטטוס</label>
                <select
                  id="community-settings-languages-filter"
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value)}
                >
                  <option value="all">כל השפות</option>
                  <option value="active">פעילות</option>
                  <option value="inactive">לא פעילות</option>
                </select>
              </div>
            </div>

            <div className="admin-list-toolbar__page-size">
              <label htmlFor="community-settings-languages-page-size">
                מספר שפות בעמוד
              </label>
              <select
                id="community-settings-languages-page-size"
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

          {filteredLanguages.length > 0 ? (
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
