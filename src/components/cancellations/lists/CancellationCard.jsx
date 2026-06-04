import RefundForm from "../forms/RefundForm";
import {
    buildWhatsAppRefundUrl,
    formatCancellationDate,
    formatPaymentAmount,
    isBitPaymentMethod,
    REFUND_STATUS_REFUNDED
} from "../helpers/cancellationHelpers";
import { hasFormattedDisplay, hasValue } from "../../../utils/hasValue";

function CancellationCard({ item, onMarkRefunded }) {
    const { cancellation, phone, paymentDisplay } = item;
    const paymentMethod = paymentDisplay?.payment_method || "";
    const isRefunded = cancellation.refund_status === REFUND_STATUS_REFUNDED;
    const whatsAppUrl = isBitPaymentMethod(paymentMethod)
        ? buildWhatsAppRefundUrl(phone)
        : "";
    const amountLabel = formatPaymentAmount(paymentDisplay);
    const cancelledAtLabel = formatCancellationDate(cancellation.cancelled_at);
    const paymentStatus = paymentDisplay?.payment_status;
    const showActivity = item.showActivity && hasValue(item.activityName);
    const showPaymentSection =
        hasFormattedDisplay(amountLabel) ||
        hasValue(paymentMethod) ||
        hasValue(paymentStatus);
    const showCancellationSection =
        hasFormattedDisplay(cancelledAtLabel) ||
        hasValue(cancellation.refund_status) ||
        hasValue(cancellation.cancellation_reason) ||
        (isRefunded && hasValue(cancellation.refund_notes));

    return (
        <div className="staff-card">
            <div className="staff-card-body">
                {hasValue(item.participantFullName) && (
                    <p>
                        <strong>משתתף:</strong> {item.participantFullName}
                    </p>
                )}
                {hasValue(phone) && (
                    <p>
                        <strong>טלפון:</strong> {phone}
                    </p>
                )}
                {hasValue(item.programTitle) && (
                    <p>
                        <strong>תוכנית:</strong> {item.programTitle}
                    </p>
                )}
                {showActivity && (
                    <p>
                        <strong>פעילות:</strong> {item.activityName}
                    </p>
                )}

                {showPaymentSection && <hr />}

                {hasFormattedDisplay(amountLabel) && (
                    <p>
                        <strong>סכום:</strong> {amountLabel}
                    </p>
                )}
                {hasValue(paymentMethod) && (
                    <p>
                        <strong>אמצעי תשלום:</strong> {paymentMethod}
                    </p>
                )}
                {hasValue(paymentStatus) && (
                    <p>
                        <strong>סטטוס תשלום:</strong> {paymentStatus}
                    </p>
                )}

                {showCancellationSection && <hr />}

                {hasFormattedDisplay(cancelledAtLabel) && (
                    <p>
                        <strong>תאריך ביטול:</strong> {cancelledAtLabel}
                    </p>
                )}
                {hasValue(cancellation.refund_status) && (
                    <p>
                        <strong>סטטוס החזר:</strong> {cancellation.refund_status}
                    </p>
                )}
                {hasValue(cancellation.cancellation_reason) && (
                    <p>
                        <strong>סיבת ביטול:</strong> {cancellation.cancellation_reason}
                    </p>
                )}
                {isRefunded && hasValue(cancellation.refund_notes) && (
                    <p>
                        <strong>הערות החזר:</strong> {cancellation.refund_notes}
                    </p>
                )}
            </div>

            <div className="staff-card-actions">
                {whatsAppUrl && (
                    <div className="row">
                        <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="staff-link-button"
                        >
                            פתיחת WhatsApp
                        </a>
                    </div>
                )}

                {!isRefunded && (
                    <RefundForm
                        cancellationId={cancellation.id}
                        currentNotes={cancellation.refund_notes}
                        onMarkRefunded={onMarkRefunded}
                    />
                )}
            </div>
        </div>
    );
}

export default CancellationCard;
