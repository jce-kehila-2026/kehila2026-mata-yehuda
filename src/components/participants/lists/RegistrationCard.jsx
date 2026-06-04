import { hasValue } from "../../../utils/hasValue";

function RegistrationCard({ registration, onCompleteRegistration }) {
    const showActivity =
        Boolean(String(registration.activity_id || "").trim()) &&
        hasValue(registration.activity_name);

    return (
        <div className="staff-card">
            <div className="staff-card-body">
                {hasValue(registration.full_name) && (
                    <p>שם: {registration.full_name}</p>
                )}
                {hasValue(registration.id_number) && (
                    <p>תעודת זהות: {registration.id_number}</p>
                )}
                {hasValue(registration.phone) && <p>טלפון: {registration.phone}</p>}
                {hasValue(registration.program_title) && (
                    <p>תוכנית: {registration.program_title}</p>
                )}
                {showActivity && <p>פעילות: {registration.activity_name}</p>}
                {hasValue(registration.registration_status) && (
                    <p>סטטוס הרשמה: {registration.registration_status}</p>
                )}
            </div>

            <div className="staff-card-actions row">
                <button
                    type="button"
                    className="staff-button"
                    onClick={() => onCompleteRegistration(registration)}
                >
                    השלמת רישום
                </button>
            </div>
        </div>
    );
}

export default RegistrationCard;
