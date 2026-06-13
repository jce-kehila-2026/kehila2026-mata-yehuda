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
        <button
          type="button"
          className="community-staff-compact-card__btn"
          onClick={onPrimaryClick}
          disabled={primaryDisabled}
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          className="community-staff-compact-card__btn community-staff-compact-card__btn--secondary"
          onClick={onViewDetails}
          disabled={primaryDisabled}
        >
          הצגת פרטים
        </button>
      </div>
    </li>
  );
}
