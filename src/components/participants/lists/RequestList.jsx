import RequestCard from "./RequestCard";

function RequestList({ requests, onCompleteRegistration }) {
    if (requests.length === 0) {
        return <p>אין בקשות רישום להצגה</p>;
    }

    return (
        <div className="staff-grid staff-grid--cards staff-grid--detailed">
            {requests.map((request) => (
                <RequestCard
                    key={request.registrationId || request.id}
                    request={request}
                    onCompleteRegistration={onCompleteRegistration}
                />
            ))}
        </div>
    );
}

export default RequestList;
