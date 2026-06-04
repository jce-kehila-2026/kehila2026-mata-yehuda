import { useCallback, useEffect, useState } from "react";
import { fetchInitialRegistrationRequests } from "../services/registrationService";
import { fetchActivities } from "../services/activityService";
import {
    DAY_CENTER_ID,
    DAY_CENTER_NAME,
    PROGRAM_60_PLUS_MINUS_DISPLAY_NAME,
    PROGRAM_60_PLUS_MINUS_ID
} from "../utils/programConstants";
import RequestList from "../components/participants/lists/RequestList";
import EditParticipant from "../components/participants/forms/EditParticipant";

const PROGRAM_FILTER_ALL = "all";

function ViewRequests() {
    const [requests, setRequests] = useState([]);
    const [activities, setActivities] = useState([]);
    const [programFilter, setProgramFilter] = useState(PROGRAM_FILTER_ALL);
    const [activityFilter, setActivityFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);

    const loadActivities = useCallback(async () => {
        try {
            const data = await fetchActivities();
            setActivities(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await fetchInitialRegistrationRequests({
                programFilter,
                activityId:
                    programFilter === PROGRAM_60_PLUS_MINUS_ID ? activityFilter : ""
            });
            setRequests(data);
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת בקשות הרישום");
        } finally {
            setLoading(false);
        }
    }, [programFilter, activityFilter]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    function handleProgramFilterChange(value) {
        setProgramFilter(value);

        if (value !== PROGRAM_60_PLUS_MINUS_ID) {
            setActivityFilter("");
        }
    }

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

    const showActivityFilter = programFilter === PROGRAM_60_PLUS_MINUS_ID;

    return (
        <div>
            <h1>צפייה בבקשות</h1>

            <div className="staff-form view-requests-filters">
                <label htmlFor="requests-program-filter">תוכנית:</label>
                <select
                    id="requests-program-filter"
                    value={programFilter}
                    onChange={(e) => handleProgramFilterChange(e.target.value)}
                >
                    <option value={PROGRAM_FILTER_ALL}>הכל</option>
                    <option value={DAY_CENTER_ID}>{DAY_CENTER_NAME}</option>
                    <option value={PROGRAM_60_PLUS_MINUS_ID}>
                        {PROGRAM_60_PLUS_MINUS_DISPLAY_NAME}
                    </option>
                </select>

                {showActivityFilter && (
                    <>
                        <label htmlFor="requests-activity-filter">פעילות:</label>
                        <select
                            id="requests-activity-filter"
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                        >
                            <option value="">כל הפעילויות</option>
                            {activities.map((activity) => (
                                <option key={activity.id} value={activity.id}>
                                    {activity.data?.name || activity.name || "ללא שם"}
                                </option>
                            ))}
                        </select>
                    </>
                )}
            </div>

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
