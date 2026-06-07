import { maskIdNumber } from "../../../utils/maskIdNumber";
import { toSafeString } from "../../../utils/participantStatusLabels";
import { hasValue } from "../../../utils/hasValue";
import ParticipantStatusBadge from "../ParticipantStatusBadge";
import { MaskedIdDisplay, ProgramDisplayName } from "../ParticipantListStats";

function RegistrationCard({ registration, onCompleteRegistration }) {
    const showActivity =
        Boolean(String(registration.activity_id || "").trim()) &&
        hasValue(registration.activity_name);
    const programLabel = registration.program_title || "—";

    return (
        <article className="registration-card staff-card">
            <div className="registration-card__body staff-card-body">
                <h3 className="registration-card__name">
                    {registration.full_name || "—"}
                </h3>

                {hasValue(registration.id_number) && (
                    <p className="registration-card__meta">
                        ת.ז.:{" "}
                        <MaskedIdDisplay
                            idNumber={maskIdNumber(registration.id_number)}
                        />
                    </p>
                )}
                {hasValue(registration.phone) && (
                    <p className="registration-card__meta">
                        טלפון: {toSafeString(registration.phone)}
                    </p>
                )}
                <p className="registration-card__meta">
                    תוכנית: <ProgramDisplayName title={programLabel} />
                </p>
                {showActivity && (
                    <p className="registration-card__meta">
                        פעילות: {registration.activity_name}
                    </p>
                )}
                {hasValue(registration.registration_status) && (
                    <p className="registration-card__meta registration-card__meta--badge">
                        <span>סטטוס הרשמה:</span>{" "}
                        <ParticipantStatusBadge
                            type="registration"
                            status={registration.registration_status}
                        />
                    </p>
                )}
            </div>

            <div className="registration-card__actions staff-card-actions">
                <button
                    type="button"
                    className="staff-button staff-button--small"
                    onClick={() => onCompleteRegistration(registration)}
                >
                    השלמת רישום
                </button>
            </div>
        </article>
    );
}

export default RegistrationCard;
