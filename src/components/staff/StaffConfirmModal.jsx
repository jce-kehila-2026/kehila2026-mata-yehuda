function StaffConfirmModal({
    message,
    onConfirm,
    onCancel,
    confirming = false,
    confirmLabel = "אישור",
    cancelLabel = "ביטול"
}) {
    if (!message) {
        return null;
    }

    return (
        <div
            className="staff-confirm-overlay"
            role="presentation"
            onClick={confirming ? undefined : onCancel}
        >
            <div
                className="staff-confirm-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="staff-confirm-message"
                onClick={(event) => event.stopPropagation()}
            >
                <p id="staff-confirm-message" className="staff-confirm-modal__message">
                    {message}
                </p>

                <div className="staff-confirm-modal__actions">
                    <button
                        type="button"
                        className="staff-button staff-confirm-modal__btn staff-confirm-modal__btn--primary"
                        onClick={onConfirm}
                        disabled={confirming}
                    >
                        {confirming ? "מעבד..." : confirmLabel}
                    </button>
                    <button
                        type="button"
                        className="staff-button staff-button--secondary staff-confirm-modal__btn"
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

export default StaffConfirmModal;
