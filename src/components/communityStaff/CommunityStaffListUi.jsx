import {
  ClipboardList,
  Filter,
  Inbox,
  Languages,
  Link2,
  List,
  Search,
  Users,
} from "lucide-react";

import {
  AdminTableActions,
  AdminTableDeleteButton,
  AdminTableEditButton,
  AdminTableViewButton,
} from "../admin/AdminTableActions.jsx";

const STATUS_LABELS = {
  pending: "ממתינה",
  active: "פעיל",
  approved: "אושרה",
  matched: "הותאם",
  rejected: "נדחתה",
  denied: "נדחתה",
  inactive: "לא פעיל",
};

export function getCommunityStaffStatusVariant(status) {
  const normalized = String(status || "").toLowerCase().trim();

  if (normalized === "pending") {
    return "pending";
  }

  if (normalized === "active") {
    return "active";
  }

  if (["approved", "matched"].includes(normalized)) {
    return "approved";
  }

  if (["rejected", "denied"].includes(normalized)) {
    return "rejected";
  }

  if (normalized === "inactive") {
    return "inactive";
  }

  return "neutral";
}

export function formatCommunityStaffStatus(status) {
  if (!status) {
    return "—";
  }

  const normalized = String(status).toLowerCase().trim();
  return STATUS_LABELS[normalized] || status;
}

export function countCommunityStaffStatuses(items, statusKey = "status") {
  const counts = { pending: 0, approved: 0, rejected: 0 };

  items.forEach((item) => {
    const variant = getCommunityStaffStatusVariant(item?.[statusKey]);

    if (variant === "pending") {
      counts.pending += 1;
      return;
    }

    if (variant === "approved" || variant === "active") {
      counts.approved += 1;
      return;
    }

    if (variant === "rejected" || variant === "inactive") {
      counts.rejected += 1;
    }
  });

  return counts;
}

export function buildRequestStatusOverviewItems(items, statusKey = "status") {
  const counts = countCommunityStaffStatuses(items, statusKey);

  return [
    { value: counts.pending, label: "ממתינות", tone: "pending" },
    { value: counts.approved, label: "אושרו", tone: "approved" },
    { value: counts.rejected, label: "נדחו", tone: "rejected" },
  ];
}

export function buildActiveInactiveOverviewItems(items, isActive) {
  let active = 0;
  let inactive = 0;

  items.forEach((item) => {
    if (isActive(item)) {
      active += 1;
    } else {
      inactive += 1;
    }
  });

  return [
    { value: active, label: "פעילים", tone: "active" },
    { value: inactive, label: "לא פעילים", tone: "inactive" },
    { value: items.length, label: 'סה"כ', tone: "neutral" },
  ];
}

export function buildMatchesOverviewItems(items) {
  return [
    { value: items.length, label: "התאמות פעילות", tone: "approved" },
    { value: items.length, label: "הותאמו", tone: "active" },
    { value: 0, label: "ממתינות להתאמה", tone: "pending" },
  ];
}

export function CommunityStaffStatusBadge({ status }) {
  const variant = getCommunityStaffStatusVariant(status);

  return (
    <span
      className={`community-staff-status-badge community-staff-status-badge--${variant}`}
    >
      {formatCommunityStaffStatus(status)}
    </span>
  );
}

export function CommunityStaffActiveBadge({ isActive }) {
  const variant = isActive ? "active" : "inactive";
  const label = isActive ? "פעיל" : "לא פעיל";

  return (
    <span
      className={`community-staff-status-badge community-staff-status-badge--${variant}`}
    >
      {label}
    </span>
  );
}

export function CommunityStaffMatchBadge() {
  return (
    <span className="community-staff-status-badge community-staff-status-badge--approved">
      הותאם
    </span>
  );
}

export function CommunityStaffStatusOverview({ items, counts }) {
  const cards =
    items ||
    (counts
      ? [
          { value: counts.pending, label: "ממתינות", tone: "pending" },
          { value: counts.approved, label: "אושרו", tone: "approved" },
          { value: counts.rejected, label: "נדחו", tone: "rejected" },
        ]
      : []);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="community-staff-status-overview" aria-label="סיכום סטטוסים">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`community-staff-status-overview__card community-staff-status-overview__card--${card.tone || "neutral"}`}
        >
          <span className="community-staff-status-overview__value">
            {card.value ?? 0}
          </span>
          <span className="community-staff-status-overview__label">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CommunityStaffListToolbar({
  searchId,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterId,
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = "סינון",
  pageSizeId,
  pageSizeValue,
  onPageSizeChange,
  pageSizeOptions,
  showFilter = true,
}) {
  return (
    <div
      className={`community-staff-request-toolbar${
        showFilter ? "" : " community-staff-request-toolbar--no-filter"
      }`}
    >
      <div className="community-staff-request-toolbar__field community-staff-request-toolbar__field--search">
        <label htmlFor={searchId}>
          <Search size={16} strokeWidth={2.25} aria-hidden="true" />
          חיפוש
        </label>
        <input
          id={searchId}
          type="search"
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>

      {showFilter && filterOptions ? (
        <div className="community-staff-request-toolbar__field">
          <label htmlFor={filterId}>
            <Filter size={16} strokeWidth={2.25} aria-hidden="true" />
            {filterLabel}
          </label>
          <select id={filterId} value={filterValue} onChange={onFilterChange}>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="community-staff-request-toolbar__field">
        <label htmlFor={pageSizeId}>
          <List size={16} strokeWidth={2.25} aria-hidden="true" />
          שורות בעמוד
        </label>
        <select id={pageSizeId} value={pageSizeValue} onChange={onPageSizeChange}>
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export const CommunityStaffRequestToolbar = CommunityStaffListToolbar;

export function CommunityStaffPagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div className="community-staff-pagination">
      <button type="button" onClick={onPrevious} disabled={currentPage <= 1}>
        הקודם
      </button>
      <span className="community-staff-pagination__label">
        עמוד {currentPage} מתוך {totalPages}
      </span>
      <button type="button" onClick={onNext} disabled={currentPage >= totalPages}>
        הבא
      </button>
    </div>
  );
}

export function CommunityStaffEmptyState({
  message = "אין נתונים להצגה כרגע",
  icon: Icon = Inbox,
}) {
  return (
    <div className="community-staff-empty-state" role="status">
      <span className="community-staff-empty-state__icon" aria-hidden="true">
        <Icon size={40} strokeWidth={1.75} />
      </span>
      <p className="community-staff-empty-state__message">{message}</p>
    </div>
  );
}

export function CommunityStaffDetailItem({ label, value }) {
  return (
    <div className="community-staff-detail-item">
      <dt className="community-staff-detail-label">{label}</dt>
      <dd className="community-staff-detail-value">{value ?? "—"}</dd>
    </div>
  );
}

export function CommunityStaffDetailsModal({
  title,
  titleId,
  onClose,
  children,
  footer,
  overlayClassName = "",
  modalClassName = "",
}) {
  return (
    <div
      className={`community-staff-details-overlay ${overlayClassName}`.trim()}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`community-staff-details-modal ${modalClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="community-staff-details-modal__header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="community-staff-details-modal__close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <div className="community-staff-details-modal__body">{children}</div>

        {footer && (
          <div className="community-staff-details-modal__footer">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function CommunityStaffCompactCard({
  name,
  phone,
  status,
  primaryLabel,
  viewLabel = "צפייה",
  onPrimaryClick,
  onViewDetails,
  primaryDisabled = false,
  onDeactivate,
  deactivateLabel = "השבתה",
  deactivateDisabled = false,
}) {
  return (
    <li className="community-staff-compact-card">
      <div className="community-staff-compact-card__main">
        <div className="community-staff-compact-card__identity">
          <span className="community-staff-compact-card__name">{name}</span>
          {phone ? (
            <span className="community-staff-compact-card__phone">{phone}</span>
          ) : null}
        </div>
        {status ? (
          <div className="community-staff-compact-card__status-wrap">{status}</div>
        ) : null}
      </div>

      <div className="community-staff-compact-card__actions">
        <AdminTableActions>
          <AdminTableViewButton
            onClick={onViewDetails}
            label={viewLabel}
            disabled={primaryDisabled}
          />
          <AdminTableEditButton
            onClick={onPrimaryClick}
            label={primaryLabel}
            disabled={primaryDisabled}
          />
          {onDeactivate ? (
            <AdminTableDeleteButton
              onClick={onDeactivate}
              label={deactivateLabel}
              disabled={deactivateDisabled || primaryDisabled}
            />
          ) : null}
        </AdminTableActions>
      </div>
    </li>
  );
}

export { ClipboardList, Languages, Link2, Users };
