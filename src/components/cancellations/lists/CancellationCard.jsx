import RefundForm from "../forms/RefundForm";
import {
    buildWhatsAppRefundUrl,
    formatCancellationDate,
    formatPaymentAmount,
    isBitPaymentMethod,
    REFUND_STATUS_REFUNDED
} from "../helpers/cancellationHelpers";

function CancellationCard({ item, onMarkRefunded }) {
    const { cancellation, phone, paymentDisplay } = item;
    const paymentMethod = paymentDisplay?.payment_method || "";
    const isRefunded = cancellation.refund_status === REFUND_STATUS_REFUNDED;
    const whatsAppUrl = isBitPaymentMethod(paymentMethod)
        ? buildWhatsAppRefundUrl(phone)
        : "";

    return (
        <div className="staff-card">
            <p>
                <strong>משתתף:</strong> {item.participantFullName}
            </p>
            <p>
                <strong>טלפון:</strong> {phone || "—"}
            </p>
            <p>
                <strong>תוכנית:</strong> {item.programTitle || "—"}
            </p>
            {item.showActivity && (
                <p>
                    <strong>פעילות:</strong> {item.activityName || "—"}
                </p>
            )}

            <hr />

            <p>
                <strong>סכום:</strong> {formatPaymentAmount(paymentDisplay)}
            </p>
            <p>
                <strong>אמצעי תשלום:</strong> {paymentMethod || "—"}
            </p>
            <p>
                <strong>סטטוס תשלום:</strong> {paymentDisplay?.payment_status || "—"}
            </p>

            <hr />

            <p>
                <strong>תאריך ביטול:</strong>{" "}
                {formatCancellationDate(cancellation.cancelled_at)}
            </p>
            <p>
                <strong>סטטוס החזר:</strong> {cancellation.refund_status || "—"}
            </p>
            {cancellation.cancellation_reason && (
                <p>
                    <strong>סיבת ביטול:</strong> {cancellation.cancellation_reason}
                </p>
            )}
            {cancellation.refund_notes && isRefunded && (
                <p>
                    <strong>הערות החזר:</strong> {cancellation.refund_notes}
                </p>
            )}

            <div className="row">
                {whatsAppUrl && (
                    <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="staff-link-button"
                    >
                        פתיחת WhatsApp
                    </a>
                )}
            </div>

            {!isRefunded && (
                <RefundForm
                    cancellationId={cancellation.id}
                    currentNotes={cancellation.refund_notes}
                    onMarkRefunded={onMarkRefunded}
                />
            )}
        </div>
    );
}

export default CancellationCard;
