import { useEffect, useState } from "react";
import RefundForm from "./forms/RefundForm";
import FormActionRow from "../shared/FormActionRow";
import {
    buildSmsRefundUrl,
    formatCancellationDate,
    formatPaymentAmount,
    formatPaymentMethodLabel,
    getRefundStatusLabel,
    isBitPaymentMethod,
    REFUND_STATUS_REFUNDED
} from "./helpers/cancellationHelpers";
import CancellationRefundStatusBadge from "./CancellationRefundStatusBadge";
import { hasValue } from "../../utils/staffManegmentUtils/hasValue";

function CancellationDetailModal({ item, onClose }) {
    if (!item) {
        return null;
    }

    const { cancellation, paymentDisplay, phone } = item;
    const paymentMethod = paymentDisplay?.payment_method || "";
    const smsUrl = isBitPaymentMethod(paymentMethod)
        ? buildSmsRefundUrl(phone)
        : "";

    return (
        <div className="cancellation-modal" role="dialog" aria-modal="true">
            <div className="cancellation-modal__backdrop" onClick={onClose} />
            <div className="cancellation-modal__panel">
                <div className="cancellation-modal__header">
                    <h3>פרטי בקשת ביטול</h3>
                    <button
                        type="button"
                        className="cancellation-modal__close"
                        onClick={onClose}
                        aria-label="סגירה"
                    >
                        ×
                    </button>
                </div>

                <div className="cancellation-modal__body">
                    <p>
                        <strong>משתתף:</strong> {item.participantFullName || "—"}
                    </p>
                    {hasValue(phone) && (
                        <p>
                            <strong>טלפון:</strong> {phone}
                        </p>
                    )}
                    <p>
                        <strong>תוכנית:</strong> {item.programTitle || "—"}
                    </p>
                    {item.showActivity && (
                        <p>
                            <strong>פעילות:</strong> {item.activityName || "—"}
                        </p>
                    )}
                    <p>
                        <strong>סכום:</strong> {formatPaymentAmount(paymentDisplay)}
                    </p>
                    <p>
                        <strong>אמצעי תשלום:</strong>{" "}
                        {formatPaymentMethodLabel(
                            paymentDisplay?.payment_method ||
                                paymentDisplay?.payment_status
                        )}
                    </p>
                    <p>
                        <strong>תאריך ביטול:</strong>{" "}
                        {formatCancellationDate(cancellation.cancelled_at)}
                    </p>
                    <p className="cancellation-modal__badge-row">
                        <strong>סטטוס החזר:</strong>{" "}
                        <CancellationRefundStatusBadge
                            status={cancellation.refund_status}
                        />
                    </p>
                    {hasValue(cancellation.cancellation_reason) && (
                        <p>
                            <strong>סיבת ביטול:</strong>{" "}
                            {cancellation.cancellation_reason}
                        </p>
                    )}
                    {hasValue(cancellation.refund_notes) && (
                        <p>
                            <strong>הערות החזר:</strong> {cancellation.refund_notes}
                        </p>
                    )}
                    {smsUrl ? (
                        <p>
                            <a
                                href={smsUrl}
                                className="staff-link-button"
                            >
                                שליחת הודעת החזר
                            </a>
                        </p>
                    ) : null}
                </div>

                <div className="cancellation-modal__footer">
                    <button
                        type="button"
                        className="staff-button staff-button--secondary staff-button--small"
                        onClick={onClose}
                    >
                        סגירה
                    </button>
                </div>
            </div>
        </div>
    );
}

function CancellationEditModal({ item, onClose, onSave }) {
    const [refundStatus, setRefundStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (item) {
            setRefundStatus(item.cancellation?.refund_status || "");
            setNotes(item.cancellation?.refund_notes || "");
            setError("");
        }
    }, [item]);

    if (!item) {
        return null;
    }

    async function handleSave() {
        setSaving(true);
        setError("");

        try {
            await onSave(item.cancellation.id, {
                refund_status: refundStatus,
                refund_notes: notes
            });
            onClose();
        } catch (err) {
            console.error(err);
            setError("שגיאה בעדכון בקשת הביטול");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="cancellation-modal" role="dialog" aria-modal="true">
            <div className="cancellation-modal__backdrop" onClick={onClose} />
            <div className="cancellation-modal__panel">
                <div className="cancellation-modal__header">
                    <h3>עריכת בקשת ביטול</h3>
                    <button
                        type="button"
                        className="cancellation-modal__close"
                        onClick={onClose}
                        aria-label="סגירה"
                    >
                        ×
                    </button>
                </div>

                <div className="cancellation-modal__body staff-form">
                    <p>
                        <strong>משתתף:</strong> {item.participantFullName || "—"}
                    </p>

                    <label htmlFor="edit-refund-status">סטטוס החזר</label>
                    <select
                        id="edit-refund-status"
                        value={refundStatus}
                        onChange={(event) => setRefundStatus(event.target.value)}
                        disabled={saving}
                    >
                        <option value="ממתין">ממתין להחזר</option>
                        <option value="הוחזר">הוחזר</option>
                        <option value="נדחה">נדחה</option>
                        <option value="לא נדרש">לא נדרש</option>
                    </select>

                    <label htmlFor="edit-refund-notes">הערות החזר</label>
                    <textarea
                        id="edit-refund-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        disabled={saving}
                    />

                    {error ? (
                        <p className="staff-alert staff-alert--error">{error}</p>
                    ) : null}
                </div>

                <div className="cancellation-modal__footer">
                    <FormActionRow
                        submitLabel={saving ? "שומר..." : "שמירת שינויים"}
                        onSubmit={handleSave}
                        onCancel={onClose}
                        isSubmitting={saving}
                    />
                </div>
            </div>
        </div>
    );
}

function CancellationRefundModal({ item, onClose, onMarkRefunded }) {
    if (!item) {
        return null;
    }

    const isRefunded =
        item.cancellation.refund_status === REFUND_STATUS_REFUNDED;

    return (
        <div className="cancellation-modal" role="dialog" aria-modal="true">
            <div className="cancellation-modal__backdrop" onClick={onClose} />
            <div className="cancellation-modal__panel">
                <div className="cancellation-modal__header">
                    <h3>עיבוד החזר כספי</h3>
                    <button
                        type="button"
                        className="cancellation-modal__close"
                        onClick={onClose}
                        aria-label="סגירה"
                    >
                        ×
                    </button>
                </div>

                <div className="cancellation-modal__body">
                    <p>
                        <strong>משתתף:</strong> {item.participantFullName || "—"}
                    </p>
                    <p>
                        <strong>סכום:</strong>{" "}
                        {formatPaymentAmount(item.paymentDisplay)}
                    </p>
                    <p>
                        <strong>סטטוס נוכחי:</strong>{" "}
                        {getRefundStatusLabel(item.cancellation.refund_status)}
                    </p>

                    {!isRefunded ? (
                        <RefundForm
                            cancellationId={item.cancellation.id}
                            currentNotes={item.cancellation.refund_notes}
                            onMarkRefunded={async (id, payload) => {
                                await onMarkRefunded(id, payload);
                                onClose();
                            }}
                        />
                    ) : (
                        <p className="staff-meta">ההחזר כבר סומן כהוחזר.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export { CancellationDetailModal, CancellationEditModal, CancellationRefundModal };
