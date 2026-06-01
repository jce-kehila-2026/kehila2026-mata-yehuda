import { is60PlusProgram } from "../helpers/participantFormHelpers";

function RequestCard({ request, onCompleteRegistration }) {
    const programTitle = request.program_title || "—";
    const showActivity = is60PlusProgram(request.program_id);

    return (
        <div className="staff-card">
            <p>תעודת זהות: {request.id_number || "—"}</p>
            <p>טלפון: {request.phone || "—"}</p>
            <p>תוכנית: {programTitle}</p>
            {showActivity && (
                <p>פעילות: {request.activity_name || "—"}</p>
            )}

            <div className="row">
                <button type="button" onClick={() => onCompleteRegistration(request)}>
                    השלמת רישום
                </button>
            </div>

            <hr />
        </div>
    );
}

export default RequestCard;
