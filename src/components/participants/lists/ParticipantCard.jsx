import { formatDate } from "../../../utils/staffManegmentUtils/dateUtils";
import { maskIdNumber } from "../../../utils/staffManegmentUtils/maskIdNumber";
import {
    resolveCanonicalProgramId,
    resolveProgramDisplayTitle
} from "../../../utils/staffManegmentUtils/programConstants";
import { toSafeString } from "../../../utils/staffManegmentUtils/participantStatusLabels";
import { hasFormattedDisplay, hasValue } from "../../../utils/staffManegmentUtils/hasValue";
import ParticipantStatusBadge from "../ParticipantStatusBadge";
import { MaskedIdDisplay, ProgramDisplayName } from "../ParticipantListStats";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton,
    AdminTableViewButton
} from "../../admin/AdminTableActions";

function getParticipantFullName(participant) {
    if (!participant) {
        return "";
    }

    return [toSafeString(participant.first_name), toSafeString(participant.last_name)]
        .filter(Boolean)
        .join(" ");
}

function getProgramLabel(participant, programs = []) {
    const programId = resolveCanonicalProgramId(participant?.program_id);

    if (!programId) {
        return "—";
    }

    const program = programs.find((item) => item.id === programId);

    return resolveProgramDisplayTitle(program, programId) || "—";
}

function ParticipantCard({
    participant,
    programs = [],
    onEdit,
    onView,
    onDelete
}) {
    const fullName = getParticipantFullName(participant) || "—";
    const programLabel = getProgramLabel(participant, programs);
    const registrationDate = formatDate(participant.registered_at);
    const handleView = onView || onEdit;

    return (
        <article className="participant-card staff-card">
            <div className="participant-card__body staff-card-body">
                <h3 className="participant-card__name">{fullName}</h3>

                {hasValue(participant.id_number) && (
                    <p className="participant-card__meta">
                        ת.ז.:{" "}
                        <MaskedIdDisplay
                            idNumber={maskIdNumber(participant.id_number)}
                        />
                    </p>
                )}
                {hasValue(participant.phone) && (
                    <p className="participant-card__meta">
                        טלפון: {toSafeString(participant.phone)}
                    </p>
                )}
                <p className="participant-card__meta">
                    תוכנית: <ProgramDisplayName title={programLabel} />
                </p>
                {hasFormattedDisplay(registrationDate) && (
                    <p className="participant-card__meta">
                        תאריך הרשמה: {registrationDate}
                    </p>
                )}
                {hasValue(toSafeString(participant.registration_status)) && (
                    <p className="participant-card__meta participant-card__meta--badge">
                        <span>סטטוס הרשמה:</span>{" "}
                        <ParticipantStatusBadge
                            type="registration"
                            status={participant.registration_status}
                        />
                    </p>
                )}
                {hasValue(toSafeString(participant.payment_status)) && (
                    <p className="participant-card__meta participant-card__meta--badge">
                        <span>סטטוס תשלום:</span>{" "}
                        <ParticipantStatusBadge
                            type="payment"
                            status={participant.payment_status}
                        />
                    </p>
                )}
            </div>

            <div className="participant-card__actions">
                <AdminTableActions>
                    {handleView ? (
                        <AdminTableViewButton
                            onClick={() => handleView(participant)}
                            label="צפייה בפרטי משתתף"
                        />
                    ) : null}
                    <AdminTableEditButton
                        onClick={() => onEdit(participant)}
                        label="עריכת משתתף"
                    />
                    <AdminTableDeleteButton
                        onClick={() => onDelete(participant)}
                        label="מחיקת משתתף"
                    />
                </AdminTableActions>
            </div>
        </article>
    );
}

export default ParticipantCard;
