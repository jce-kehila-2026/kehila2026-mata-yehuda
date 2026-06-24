import {
    getRequestDisplayName,
    getRequestStatusLabel
} from "../../services/dayCenterVolunteerRequestService";

function VolunteerRequestCard({ request, onViewDetails }) {
    const fullName = getRequestDisplayName(request);

    return (
        <article className="day-center-volunteers-card day-center-volunteers-card--request">
            <div className="day-center-volunteers-card__header">
                <h3 className="day-center-volunteers-card__title">{fullName}</h3>
                <span
                    className={`day-center-volunteers-request-status day-center-volunteers-request-status--${request.status}`}
                >
                    {getRequestStatusLabel(request.status)}
                </span>
            </div>

            <dl className="day-center-volunteers-card__details">
                <div>
                    <dt>טלפון</dt>
                    <dd>{request.phone || "—"}</dd>
                </div>
                {request.id_number ? (
                    <div>
                        <dt>תעודת זהות</dt>
                        <dd>{request.id_number}</dd>
                    </div>
                ) : null}
            </dl>

            <div className="day-center-volunteers-card__actions">
                <button
                    type="button"
                    className="staff-button staff-button--small staff-button--secondary"
                    onClick={() => onViewDetails?.(request)}
                >
                    צפייה
                </button>
            </div>
        </article>
    );
}

export default VolunteerRequestCard;
