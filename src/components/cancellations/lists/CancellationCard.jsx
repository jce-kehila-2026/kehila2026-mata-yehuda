import CancellationRefundStatusBadge from "../CancellationRefundStatusBadge";
import {
    formatCancellationDate,
    formatPaymentAmount,
    formatPaymentMethodLabel,
    REFUND_STATUS_REFUNDED
} from "../helpers/cancellationHelpers";
import { hasFormattedDisplay, hasValue } from "../../../utils/staffManegmentUtils/hasValue";
import {
    AdminTableActions,
    AdminTableEditButton,
    AdminTableProcessButton,
    AdminTableViewButton
} from "../../admin/AdminTableActions";

function CancellationCard({ item, onView, onEdit, onProcessRefund }) {
    const { cancellation, paymentDisplay } = item;
    const isRefunded = cancellation.refund_status === REFUND_STATUS_REFUNDED;

    return (
        <article className="cancellation-card staff-card">
            <div className="cancellation-card__body staff-card-body">
                <h3 className="cancellation-card__name">
                    {item.participantFullName || "—"}
                </h3>

                {hasValue(item.programTitle) && (
                    <p className="cancellation-card__meta">
                        תוכנית: {item.programTitle}
                    </p>
                )}
                {item.showActivity && hasValue(item.activityName) && (
                    <p className="cancellation-card__meta">
                        פעילות: {item.activityName}
                    </p>
                )}
                <p className="cancellation-card__meta">
                    סכום: {formatPaymentAmount(paymentDisplay)}
                </p>
                <p className="cancellation-card__meta">
                    אמצעי תשלום:{" "}
                    {formatPaymentMethodLabel(
                        paymentDisplay?.payment_method ||
                            paymentDisplay?.payment_status
                    )}
                </p>
                <p className="cancellation-card__meta">
                    תאריך ביטול:{" "}
                    {formatCancellationDate(cancellation.cancelled_at)}
                </p>
                <p className="cancellation-card__meta cancellation-card__meta--badge">
                    <span>סטטוס החזר:</span>{" "}
                    <CancellationRefundStatusBadge
                        status={cancellation.refund_status}
                    />
                </p>
            </div>

            <div className="cancellation-card__actions">
                <AdminTableActions>
                    <AdminTableViewButton
                        onClick={() => onView(item)}
                        label="צפייה בפרטי ביטול"
                    />
                    <AdminTableProcessButton
                        onClick={() => onProcessRefund(item)}
                        label="עיבוד החזר"
                        disabled={isRefunded}
                    />
                    <AdminTableEditButton
                        onClick={() => onEdit(item)}
                        label="עריכת בקשת ביטול"
                    />
                </AdminTableActions>
            </div>
        </article>
    );
}

export default CancellationCard;
