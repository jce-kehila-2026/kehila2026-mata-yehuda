import { useState } from "react";
import { REFUND_STATUS_REFUNDED } from "../helpers/cancellationHelpers";
import FormActionRow from "../../shared/FormActionRow";

function RefundForm({ cancellationId, currentNotes, onMarkRefunded, disabled }) {
    const [notes, setNotes] = useState(currentNotes || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleMarkRefunded() {
        setSaving(true);
        setError("");

        try {
            await onMarkRefunded(cancellationId, {
                refund_status: REFUND_STATUS_REFUNDED,
                refund_notes: notes
            });
        } catch (err) {
            console.log(err);
            setError("שגיאה בעדכון סטטוס ההחזר");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="staff-form cancellation-refund-form">
            <label htmlFor={`refund-notes-${cancellationId}`}>הערות החזר (אופציונלי)</label>
            <textarea
                id={`refund-notes-${cancellationId}`}
                placeholder="הערות להחזר כספי"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={disabled || saving}
            />

            {error && <p className="staff-alert staff-alert--error">{error}</p>}

            <FormActionRow
                submitLabel={saving ? "שומר..." : "סמן כהוחזר"}
                onSubmit={handleMarkRefunded}
                isSubmitting={saving}
                submitDisabled={disabled}
            />
        </div>
    );
}

export default RefundForm;
