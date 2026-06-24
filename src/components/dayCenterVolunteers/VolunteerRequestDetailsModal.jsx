import { X } from "lucide-react";
import {
    formatRequestTimestamp,
    getRequestDisplayName,
    getRequestStatusLabel,
    REQUEST_STATUS_PENDING
} from "../../services/dayCenterVolunteerRequestService";

function DetailRow({ label, value }) {
    return (
        <div className="day-center-volunteers-request-details__row">
            <dt>{label}</dt>
            <dd>{value || "—"}</dd>
        </div>
    );
}

function VolunteerRequestDetailsModal({
    request,
    onClose,
    onApprove,
    onReject,
    isProcessing = false,
    error = ""
}) {
    if (!request) {
        return null;
    }

    const isPending = request.status === REQUEST_STATUS_PENDING;
    const fullName = getRequestDisplayName(request);

    return (
        <div
            className="day-center-volunteers-modal-overlay"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="day-center-volunteers-modal day-center-volunteers-modal--details"
                role="dialog"
                aria-modal="true"
                aria-labelledby="volunteer-request-details-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="day-center-volunteers-modal__close"
                    onClick={onClose}
                    aria-label="סגירת חלון"
                    disabled={isProcessing}
                >
                    <X strokeWidth={2} aria-hidden="true" />
                </button>

                <div className="day-center-volunteers-modal__body">
                    <div className="day-center-volunteers-modal__header">
                        <h2
                            id="volunteer-request-details-title"
                            className="day-center-volunteers-modal__title"
                        >
                            בקשת התנדבות – {fullName}
                        </h2>
                    </div>

                    <div className="day-center-volunteers-request-details">
                    <div className="day-center-volunteers-request-details__status-row">
                        <span className="day-center-volunteers-request-details__status-label">
                            סטטוס
                        </span>
                        <span
                            className={`day-center-volunteers-request-status day-center-volunteers-request-status--${request.status}`}
                        >
                            {getRequestStatusLabel(request.status)}
                        </span>
                    </div>

                    <dl className="day-center-volunteers-request-details__grid">
                        <DetailRow label="שם פרטי" value={request.first_name} />
                        <DetailRow label="שם משפחה" value={request.last_name} />
                        <DetailRow label="תעודת זהות" value={request.id_number} />
                        <DetailRow label="טלפון" value={request.phone} />
                        <DetailRow label="ספר/י על עצמך" value={request.about_me} />
                        <DetailRow
                            label="תאריך הגשה"
                            value={formatRequestTimestamp(request.created_at)}
                        />
                        {request.approved_at ? (
                            <DetailRow
                                label="תאריך אישור"
                                value={formatRequestTimestamp(request.approved_at)}
                            />
                        ) : null}
                        {request.rejected_at ? (
                            <DetailRow
                                label="תאריך דחייה"
                                value={formatRequestTimestamp(request.rejected_at)}
                            />
                        ) : null}
                    </dl>

                    {error ? (
                        <p className="staff-alert staff-alert--error">{error}</p>
                    ) : null}

                    {isPending ? (
                        <div className="day-center-volunteers-request-details__actions">
                            <button
                                type="button"
                                className="staff-button day-center-volunteers-request-details__approve-btn"
                                onClick={() => onApprove?.(request)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "מעבד..." : "אישור"}
                            </button>
                            <button
                                type="button"
                                className="staff-button staff-button--secondary day-center-volunteers-request-details__reject-btn"
                                onClick={() => onReject?.(request)}
                                disabled={isProcessing}
                            >
                                דחייה
                            </button>
                        </div>
                    ) : null}
                </div>
                </div>
            </div>
        </div>
    );
}

export default VolunteerRequestDetailsModal;
