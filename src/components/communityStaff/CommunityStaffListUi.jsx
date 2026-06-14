import {
  AdminTableActions,
  AdminTableDeleteButton,
  AdminTableEditButton,
  AdminTableViewButton,
} from "../admin/AdminTableActions.jsx";

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
  onPrimaryClick,
  onViewDetails,
  primaryDisabled = false,
  onDeactivate,
  deactivateLabel = "השבתה",
  deactivateDisabled = false,
}) {
  return (
    <li className="community-staff-compact-card">
      <div className="community-staff-compact-card__info">
        <span className="community-staff-compact-card__name">{name}</span>
        {phone ? (
          <span className="community-staff-compact-card__phone">{phone}</span>
        ) : null}
        {status}
      </div>

      <div className="community-staff-compact-card__actions">
        <AdminTableActions>
          <AdminTableViewButton
            onClick={onViewDetails}
            label="הצגת פרטים"
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
