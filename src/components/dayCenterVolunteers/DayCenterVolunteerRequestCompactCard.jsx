import { Check, Eye, X } from "lucide-react";
import { AdminTableActions } from "../admin/AdminTableActions";
import {
    formatRequestTimestamp,
    getRequestDisplayName,
    getRequestStatusLabel
} from "../../services/dayCenterVolunteerRequestService";

function DayCenterVolunteerRequestCompactCard({
    request,
    onViewDetails,
    onApprove,
    onReject,
    disabled = false
}) {
    const fullName = getRequestDisplayName(request);

    return (
        <article className="day-center-volunteers-card">
            <div className="day-center-volunteers-card__header">
                <h3 className="day-center-volunteers-card__title">{fullName}</h3>
                <span
                    className={`day-center-volunteers-request-status day-center-volunteers-request-status--${request.status}`}
                >
                    {getRequestStatusLabel(request.status)}
                </span>
            </div>

            <dl className="day-center-volunteers-card__details">
                {request.id_number ? (
                    <div>
                        <dt>תעודת זהות</dt>
                        <dd>{request.id_number}</dd>
                    </div>
                ) : null}
                <div>
                    <dt>טלפון</dt>
                    <dd>{request.phone || "—"}</dd>
                </div>
                {request.about_me?.trim() ? (
                    <div>
                        <dt>אודות</dt>
                        <dd>{request.about_me}</dd>
                    </div>
                ) : null}
                <div>
                    <dt>תאריך הגשה</dt>
                    <dd>{formatRequestTimestamp(request.created_at)}</dd>
                </div>
            </dl>

            <div className="day-center-volunteers-card__actions">
                <AdminTableActions>
                    <button
                        type="button"
                        className="admin-table-action admin-table-action--view"
                        onClick={() => onViewDetails?.(request)}
                        disabled={disabled}
                        title="צפייה"
                        aria-label="צפייה"
                    >
                        <Eye
                            className="admin-table-action__icon"
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        type="button"
                        className="admin-table-action admin-table-action--edit"
                        onClick={() => onApprove?.(request)}
                        disabled={disabled}
                        title="אישור"
                        aria-label="אישור"
                    >
                        <Check
                            className="admin-table-action__icon"
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        type="button"
                        className="admin-table-action admin-table-action--delete"
                        onClick={() => onReject?.(request)}
                        disabled={disabled}
                        title="דחייה"
                        aria-label="דחייה"
                    >
                        <X
                            className="admin-table-action__icon"
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </button>
                </AdminTableActions>
            </div>
        </article>
    );
}

export default DayCenterVolunteerRequestCompactCard;
