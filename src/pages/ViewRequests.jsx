import { useCallback, useEffect, useState } from "react";
import { fetchInitialRegistrationRequests } from "../services/registrationService";
import RequestList from "../components/participants/lists/RequestList";
import EditParticipant from "../components/participants/forms/EditParticipant";

function ViewRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchInitialRegistrationRequests();
            setRequests(data);
        } catch (err) {
            console.log(err);
            setError("שגיאה בטעינת בקשות הרישום");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    function handleCompleteRegistration(request) {
        setSelectedRequest(request);
    }

    function handleRegistrationCompleted() {
        setSelectedRequest(null);
        loadRequests();
    }

    function handleCancelComplete() {
        setSelectedRequest(null);
    }

    if (selectedRequest) {
        return (
            <div>
                <EditParticipant
                    participant={selectedRequest}
                    completeRegistration
                    onCompleted={handleRegistrationCompleted}
                    onCancel={handleCancelComplete}
                />
            </div>
        );
    }

    return (
        <div>
            <h1>צפייה בבקשות</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>טוען...</p>}

            {!loading && !error && (
                <RequestList
                    requests={requests}
                    onCompleteRegistration={handleCompleteRegistration}
                />
            )}
        </div>
    );
}

export default ViewRequests;
