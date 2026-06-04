import { hasValue } from "../../../utils/hasValue";

function RequestCard({ request, onCompleteRegistration }) {
    const showActivity =
        Boolean(String(request.activity_id || "").trim()) &&
        hasValue(request.activity_name);

    return (
        <div className="staff-card">
            <div className="staff-card-body">
                {hasValue(request.full_name) && <p>שם: {request.full_name}</p>}
                {hasValue(request.id_number) && (
                    <p>תעודת זהות: {request.id_number}</p>
                )}
                {hasValue(request.phone) && <p>טלפון: {request.phone}</p>}
                {hasValue(request.program_title) && (
                    <p>תוכנית: {request.program_title}</p>
                )}
                {showActivity && <p>פעילות: {request.activity_name}</p>}
                {hasValue(request.registration_status) && (
                    <p>סטטוס הרשמה: {request.registration_status}</p>
                )}
            </div>

            <div className="staff-card-actions row">
                <button
                    type="button"
                    className="staff-button"
                    onClick={() => onCompleteRegistration(request)}
                >
                    השלמת רישום
                </button>
            </div>
        </div>
    );
}

export default RequestCard;
