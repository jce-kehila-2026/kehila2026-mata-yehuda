import { useCallback, useEffect, useState } from "react";
import {
    fetchInitialRegistrationRequests,
    fetchPendingRegistrationRequest
} from "../services/registrationService";
import { fetchActivities } from "../services/activityService";
import { PROGRAM_60_PLUS_MINUS_ID } from "../utils/programConstants";
import RegistrationList from "../components/participants/lists/RegistrationList";
import EditParticipant from "../components/participants/forms/EditParticipant";
import {
    buildStaffPage,
    staffNavigateBack,
    STAFF_PENDING_REGISTRATION_ID_KEY,
    STAFF_RETURN_PAGE_KEY
} from "../utils/staffNavigation";

const PROGRAM_FILTER_ALL = "all";

function ViewRegistrations({
    registrationView,
    onNavigate,
    onReturnToDashboard
}) {
    const [registrations, setRegistrations] = useState([]);
    const [activities, setActivities] = useState([]);
    const [programFilter, setProgramFilter] = useState(PROGRAM_FILTER_ALL);
    const [activityFilter, setActivityFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [completeLoading, setCompleteLoading] = useState(false);
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
            setCompleteLoading(false);
        }
    }, [showCompleteRegistration]);

    useEffect(() => {
        if (!showCompleteRegistration || selectedRegistration) {
            return undefined;
        }

        const pendingRegistrationId =
            window.history.state?.[STAFF_PENDING_REGISTRATION_ID_KEY];

        if (!pendingRegistrationId) {
            return undefined;
        }

        let cancelled = false;
        setCompleteLoading(true);
        setError("");

        fetchPendingRegistrationRequest(pendingRegistrationId)
            .then((request) => {
                if (cancelled) {
                    return;
                }

                if (request) {
                    setSelectedRegistration(request);
                } else {
                    setError("לא נמצאה בקשת רישום ממתינה");
                }
            })
            .catch((err) => {
                console.error(err);

                if (!cancelled) {
                    setError("שגיאה בטעינת בקשת הרישום");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setCompleteLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [showCompleteRegistration, selectedRegistration]);

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
        const returnPage = window.history.state?.[STAFF_RETURN_PAGE_KEY];

        if (returnPage === "dashboard") {
            onReturnToDashboard?.();
            return;
        }

        staffNavigateBack();
        loadRegistrations();
    }

    function handleCancelComplete() {
        const returnPage = window.history.state?.[STAFF_RETURN_PAGE_KEY];

        if (returnPage === "dashboard") {
            onNavigate("dashboard");
            return;
        }

        staffNavigateBack();
    }

    if (showCompleteRegistration && completeLoading) {
        return (
            <div className="staff-page staff-page--registrations-edit">
                <header className="staff-header">
                    <h1>השלמת רישום</h1>
                </header>
                <div className="staff-container">
                    <p className="staff-meta">טוען...</p>
                </div>
            </div>
        );
    }

    if (showCompleteRegistration && !selectedRegistration) {
        return (
            <div className="staff-page staff-page--registrations-edit">
                <header className="staff-header">
                    <h1>השלמת רישום</h1>
                </header>
                <div className="staff-container">
                    {error ? (
                        <p className="staff-alert staff-alert--error">{error}</p>
                    ) : null}
                    <div className="staff-toolbar">
                        <button
                            type="button"
                            className="staff-button staff-button--secondary staff-button--small"
                            onClick={handleCancelComplete}
                        >
                            חזרה
                        </button>
                    </div>
                </div>
            </div>
        );
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
                            {window.history.state?.[STAFF_RETURN_PAGE_KEY] ===
                            "dashboard"
                                ? "חזרה ללוח הבקרה"
                                : "חזרה לצפייה בבקשות"}
                        </button>
                    </div>
                    <section className="staff-section staff-section--form">
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

    return (
        <div className="staff-page staff-page--registrations">
            <div className="staff-container staff-container--registrations">
                <section className="staff-section staff-section--list staff-section--registrations-list">
                    <RegistrationList
                        registrations={registrations}
                        loading={loading}
                        error={error}
                        activities={activities}
                        programFilter={programFilter}
                        activityFilter={activityFilter}
                        onProgramFilterChange={handleProgramFilterChange}
                        onActivityFilterChange={setActivityFilter}
                        onCompleteRegistration={handleCompleteRegistration}
                    />
                </section>
            </div>
        </div>
    );
}

export default ViewRegistrations;
