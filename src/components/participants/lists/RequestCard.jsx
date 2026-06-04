function RequestCard({ request, onCompleteRegistration }) {
    const programTitle = request.program_title || "—";
    const hasActivity = Boolean(String(request.activity_id || "").trim());

    return (
        <div className="staff-card">
            <p>שם: {request.full_name || "—"}</p>
            <p>תעודת זהות: {request.id_number || "—"}</p>
            <p>טלפון: {request.phone || "—"}</p>
            <p>תוכנית: {programTitle}</p>
            {hasActivity && (
                <p>פעילות: {request.activity_name || "—"}</p>
            )}
            <p>סטטוס הרשמה: {request.registration_status || "—"}</p>

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
