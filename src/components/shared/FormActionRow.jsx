/**
 * Standard admin form action row (RTL): [Primary] [ביטול]
 */
function FormActionRow({
    submitLabel,
    onSubmit,
    onCancel,
    cancelLabel = "ביטול",
    isSubmitting = false,
    submitDisabled = false,
    cancelDisabled = false
}) {
    const primaryDisabled = submitDisabled || isSubmitting;
    const secondaryDisabled = cancelDisabled || isSubmitting;

    return (
        <div className="staff-form__actions">
            <button
                type="button"
                className="staff-button staff-form__submit"
                onClick={onSubmit}
                disabled={primaryDisabled}
            >
                {submitLabel}
            </button>
            {onCancel ? (
                <button
                    type="button"
                    className="staff-button staff-button--secondary staff-form__cancel btn-secondary"
                    onClick={onCancel}
                    disabled={secondaryDisabled}
                >
                    {cancelLabel}
                </button>
            ) : null}
        </div>
    );
}

export default FormActionRow;
