import { useCallback, useEffect, useState } from "react";
import { fetchInitialRegistrationRequests } from "../services/registrationService";
import { fetchActivities } from "../services/activityService";
import {
    DAY_CENTER_ID,
    DAY_CENTER_NAME,
    PROGRAM_60_PLUS_MINUS_DISPLAY_NAME,
    PROGRAM_60_PLUS_MINUS_ID
} from "../utils/programConstants";
import RegistrationList from "../components/participants/lists/RegistrationList";
import EditParticipant from "../components/participants/forms/EditParticipant";
import { buildStaffPage, staffNavigateBack } from "../utils/staffNavigation";

const PROGRAM_FILTER_ALL = "all";

function ViewRegistrations({ registrationView, onNavigate }) {
    const [registrations, setRegistrations] = useState([]);
    const [activities, setActivities] = useState([]);
    const [programFilter, setProgramFilter] = useState(PROGRAM_FILTER_ALL);
    const [activityFilter, setActivityFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const showCompleteRegistration = registrationView === "complete";

    const loadActivities = useCallback(async () => {
        try {
            const data = await fetchActivities();
            setActivities(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const loadRegistrations = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await fetchInitialRegistrationRequests({
                programFilter,
                activityId:
                    programFilter === PROGRAM_60_PLUS_MINUS_ID ? activityFilter : ""
            });
            setRegistrations(data);
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
        loadRegistrations();
    }, [loadRegistrations]);

    useEffect(() => {
        if (!showCompleteRegistration) {
            setSelectedRegistration(null);
        }
    }, [showCompleteRegistration]);

    function handleProgramFilterChange(value) {
        setProgramFilter(value);

        if (value !== PROGRAM_60_PLUS_MINUS_ID) {
            setActivityFilter("");
        }
    }

    function handleCompleteRegistration(registration) {
        setSelectedRegistration(registration);
        onNavigate(buildStaffPage("registrations", "complete"));
    }

    function handleRegistrationCompleted() {
        setSelectedRegistration(null);
        staffNavigateBack();
        loadRegistrations();
    }

    function handleCancelComplete() {
        staffNavigateBack();
    }

    if (showCompleteRegistration && selectedRegistration) {
        return (
            <div className="staff-page staff-page--registrations-edit">
                <header className="staff-header">
                    <h1>השלמת רישום</h1>
                </header>
                <div className="staff-container">
                    <div className="staff-toolbar">
                        <button
                            type="button"
                            className="staff-button staff-button--secondary staff-button--small"
                            onClick={handleCancelComplete}
                        >
                            חזרה לצפייה בבקשות
                        </button>
                    </div>
                    <section className="staff-section">
                        <EditParticipant
                            participant={selectedRegistration}
                            completeRegistration
                            onCompleted={handleRegistrationCompleted}
                            onCancel={handleCancelComplete}
                        />
                    </section>
                </div>
            </div>
        );
    }

    const showActivityFilter = programFilter === PROGRAM_60_PLUS_MINUS_ID;

    return (
        <div className="staff-page staff-page--registrations">
            <header className="staff-header">
                <h1>צפייה בבקשות</h1>
            </header>

            <div className="staff-container">
                <section className="staff-section staff-section--filters staff-form view-registrations-filters">
                    <label htmlFor="registrations-program-filter">תוכנית:</label>
                    <select
                        id="registrations-program-filter"
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
                            <label htmlFor="registrations-activity-filter">פעילות:</label>
                            <select
                                id="registrations-activity-filter"
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
                </section>

                {error && <p className="staff-alert staff-alert--error">{error}</p>}
                {loading && <p className="staff-meta">טוען...</p>}

                {!loading && !error && (
                    <section className="staff-section staff-section--list">
                        <RegistrationList
                            registrations={registrations}
                            onCompleteRegistration={handleCompleteRegistration}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}

export default ViewRegistrations;
