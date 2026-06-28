import { useCallback, useEffect, useState } from "react";
import {
    fetchInitialRegistrationRequests,
    fetchPendingRegistrationRequest
} from "../../services/staffManegmentServices/registrationService";
import { fetchActivities } from "../../services/staffManegmentServices/activityService";
import { PROGRAM_60_PLUS_MINUS_ID } from "../../utils/staffManegmentUtils/programConstants";
import RegistrationList from "../../components/participants/lists/RegistrationList";
import EditParticipant from "../../components/participants/forms/EditParticipant";
import {
    buildStaffPage,
    staffNavigateBack,
    STAFF_PENDING_REGISTRATION_ID_KEY,
    STAFF_RETURN_PAGE_KEY
} from "../../utils/staffManegmentUtils/staffNavigation";

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

    const pageDecorations = (
        <>
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="list-mgmt-decoration list-mgmt-decoration--top"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="list-mgmt-decoration list-mgmt-decoration--left"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="list-mgmt-decoration list-mgmt-decoration--bottom"
            />
        </>
    );

    const completeBackLabel =
        window.history.state?.[STAFF_RETURN_PAGE_KEY] === "dashboard"
            ? "חזרה ללוח הבקרה"
            : "חזרה לצפייה בבקשות";

    if (showCompleteRegistration && completeLoading) {
        return (
            <div
                className="staff-page staff-page--registrations-edit list-mgmt-page"
                dir="rtl"
            >
                {pageDecorations}
                <div className="staff-container">
                    <header className="list-mgmt-page__header">
                        <div className="list-mgmt-page__header-main">
                            <h1 className="list-mgmt-page__title">השלמת רישום</h1>
                            <p className="list-mgmt-page__subtitle">
                                השלמת פרטי המשתתף לרישום במערכת
                            </p>
                        </div>
                    </header>
                    <p className="list-mgmt-loading">טוען...</p>
                </div>
            </div>
        );
    }

    if (showCompleteRegistration && !selectedRegistration) {
        return (
            <div
                className="staff-page staff-page--registrations-edit list-mgmt-page"
                dir="rtl"
            >
                {pageDecorations}
                <div className="staff-container">
                    <header className="list-mgmt-page__header">
                        <div className="list-mgmt-page__header-main">
                            <h1 className="list-mgmt-page__title">השלמת רישום</h1>
                            <p className="list-mgmt-page__subtitle">
                                השלמת פרטי המשתתף לרישום במערכת
                            </p>
                        </div>
                        <div className="list-mgmt-page__actions">
                            <button
                                type="button"
                                className="staff-back-button"
                                onClick={handleCancelComplete}
                            >
                                <span
                                    className="staff-back-button__icon"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                                חזרה
                            </button>
                        </div>
                    </header>
                    {error ? (
                        <p className="staff-alert staff-alert--error">{error}</p>
                    ) : null}
                </div>
            </div>
        );
    }

    if (showCompleteRegistration && selectedRegistration) {
        return (
            <div
                className="staff-page staff-page--registrations-edit list-mgmt-page"
                dir="rtl"
            >
                {pageDecorations}
                <div className="staff-container">
                    <header className="list-mgmt-page__header">
                        <div className="list-mgmt-page__header-main">
                            <h1 className="list-mgmt-page__title">השלמת רישום</h1>
                            <p className="list-mgmt-page__subtitle">
                                השלמת פרטי המשתתף לרישום במערכת
                            </p>
                        </div>
                        <div className="list-mgmt-page__actions">
                            <button
                                type="button"
                                className="staff-back-button"
                                onClick={handleCancelComplete}
                            >
                                <span
                                    className="staff-back-button__icon"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                                {completeBackLabel}
                            </button>
                        </div>
                    </header>
                    <div className="registrations-complete-card">
                        <EditParticipant
                            participant={selectedRegistration}
                            completeRegistration
                            onCompleted={handleRegistrationCompleted}
                            onCancel={handleCancelComplete}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="staff-page staff-page--registrations list-mgmt-page"
            dir="rtl"
        >
            {pageDecorations}

            <div className="staff-container staff-container--registrations">
                <header className="list-mgmt-page__header">
                    <div className="list-mgmt-page__header-main">
                        <h1 className="list-mgmt-page__title">בקשות הרשמה</h1>
                        <p className="list-mgmt-page__subtitle">
                            ניהול והשלמה של בקשות רישום שהתקבלו מהמערכת
                        </p>
                    </div>
                    {onNavigate ? (
                        <div className="list-mgmt-page__actions">
                            <button
                                type="button"
                                className="staff-back-button"
                                onClick={() => onNavigate("dashboard")}
                            >
                                <span
                                    className="staff-back-button__icon"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                                חזרה ללוח הבקרה
                            </button>
                        </div>
                    ) : null}
                </header>

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
            </div>
        </div>
    );
}

export default ViewRegistrations;
