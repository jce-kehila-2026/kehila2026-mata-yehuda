import { Check, Eye, X } from "lucide-react";
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
        <li className="community-staff-compact-card day-center-volunteer-request-card">
            <div className="community-staff-compact-card__main">
                <div className="community-staff-compact-card__identity">
                    <span className="community-staff-compact-card__name">{fullName}</span>
                    {request.phone ? (
                        <span className="community-staff-compact-card__phone">
                            {request.phone}
                        </span>
                    ) : null}
                    {request.id_number ? (
                        <span className="day-center-volunteer-request-card__meta">
                            ת.ז. {request.id_number}
                        </span>
                    ) : null}
                    {request.about_me?.trim() ? (
                        <span
                            className="day-center-volunteer-request-card__about"
                            title={request.about_me}
                        >
                            {request.about_me}
                        </span>
                    ) : null}
                    <span className="day-center-volunteer-request-card__date">
                        תאריך הגשה: {formatRequestTimestamp(request.created_at)}
                    </span>
                </div>
                <div className="community-staff-compact-card__status-wrap">
                    <span
                        className={`day-center-volunteers-request-status day-center-volunteers-request-status--${request.status}`}
                    >
                        {getRequestStatusLabel(request.status)}
                    </span>
                </div>
            </div>

            <div className="community-staff-compact-card__actions">
                <div className="admin-data-table__actions admin-data-table__actions--compact day-center-volunteer-request-card__actions">
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
                        className="admin-table-action admin-table-action--edit day-center-volunteer-request-card__approve-btn"
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
                </div>
            </div>
        </li>
    );
}

export default DayCenterVolunteerRequestCompactCard;
