function CommunityStaffConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirming = false,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="community-staff-confirm-overlay"
      role="presentation"
      onClick={confirming ? undefined : onCancel}
    >
      <div
        className="community-staff-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="community-staff-confirm-message"
        onClick={(event) => event.stopPropagation()}
      >
        <p
          id="community-staff-confirm-message"
          className="community-staff-confirm-modal__message"
        >
          {message}
        </p>

        <div className="community-staff-confirm-modal__actions">
          <button
            type="button"
            className="community-staff-confirm-modal__btn community-staff-confirm-modal__btn--primary"
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? "מעבד..." : confirmLabel}
          </button>
          <button
            type="button"
            className="community-staff-confirm-modal__btn community-staff-confirm-modal__btn--secondary"
            onClick={onCancel}
            disabled={confirming}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityStaffConfirmModal;
