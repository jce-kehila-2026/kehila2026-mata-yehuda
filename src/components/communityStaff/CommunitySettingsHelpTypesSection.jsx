import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllHelpTypes,
  setHelpTypeActive,
} from "../../services/communityStaff/communitySettingsService";
import CommunitySettingsItemCard from "./CommunitySettingsItemCard.jsx";
import HelpTypeFormModal from "./HelpTypeFormModal.jsx";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { CommunityStaffEmptyState } from "./CommunityStaffListUi.jsx";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

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

  const helpTypeStats = useMemo(() => {
    let active = 0;

    helpTypes.forEach((helpType) => {
      if (helpType.is_active === true) {
        active += 1;
      }
    });

    return {
      total: helpTypes.length,
      active,
      inactive: helpTypes.length - active,
    };
  }, [helpTypes]);

  const safePage = Math.min(currentPage, totalPages);

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
          <section
            className="activities-mgmt-summary"
            aria-label="סיכום סוגי עזרה"
          >
            <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
              <span className="activities-mgmt-summary__icon">
                <ClipboardList size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="activities-mgmt-summary__value">
                {helpTypeStats.total}
              </span>
              <span className="activities-mgmt-summary__label">
                סה״כ סוגי עזרה
              </span>
              <span className="activities-mgmt-summary__hint">
                כל סוגי העזרה במערכת
              </span>
            </div>
            <div className="activities-mgmt-summary__card activities-mgmt-summary__card--participants">
              <span className="activities-mgmt-summary__icon">
                <CheckCircle2 size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="activities-mgmt-summary__value">
                {helpTypeStats.active}
              </span>
              <span className="activities-mgmt-summary__label">פעילים</span>
              <span className="activities-mgmt-summary__hint">
                סוגי עזרה זמינים לשימוש
              </span>
            </div>
            <div className="activities-mgmt-summary__card activities-mgmt-summary__card--open">
              <span className="activities-mgmt-summary__icon">
                <XCircle size={22} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="activities-mgmt-summary__value">
                {helpTypeStats.inactive}
              </span>
              <span className="activities-mgmt-summary__label">לא פעילים</span>
              <span className="activities-mgmt-summary__hint">
                סוגי עזרה מושבתים כרגע
              </span>
            </div>
          </section>

          <div className="admin-list-toolbar staff-form staff-list-filters">
            <div className="admin-list-toolbar__search">
              <label htmlFor="community-settings-help-types-search">חיפוש</label>
              <input
                id="community-settings-help-types-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="חיפוש לפי שם או תיאור..."
              />
            </div>

            <div className="admin-list-toolbar__filters">
              <div>
                <label htmlFor="community-settings-help-types-filter">
                  סטטוס
                </label>
                <select
                  id="community-settings-help-types-filter"
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value)}
                >
                  <option value="all">כל סוגי העזרה</option>
                  <option value="active">פעילים</option>
                  <option value="inactive">לא פעילים</option>
                </select>
              </div>
            </div>

            <div className="admin-list-toolbar__page-size">
              <label htmlFor="community-settings-help-types-page-size">
                מספר סוגים בעמוד
              </label>
              <select
                id="community-settings-help-types-page-size"
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

          {filteredHelpTypes.length > 0 ? (
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
