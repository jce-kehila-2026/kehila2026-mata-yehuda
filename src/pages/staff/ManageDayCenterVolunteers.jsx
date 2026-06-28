import { useCallback, useEffect, useState } from "react";
import { Clock, Plus, UserCheck, UserX } from "lucide-react";
import DayCenterVolunteerDetailsModal from "../../components/dayCenterVolunteers/DayCenterVolunteerDetailsModal";
import DayCenterVolunteerRequestsList from "../../components/dayCenterVolunteers/DayCenterVolunteerRequestsList";
import DayCenterVolunteersList from "../../components/dayCenterVolunteers/DayCenterVolunteersList";
import VolunteerForm from "../../components/dayCenterVolunteers/VolunteerForm";
import { getPendingDayCenterVolunteerRequests } from "../../services/dayCenterVolunteerRequestService";
import {
    addDayCenterVolunteer,
    getDayCenterVolunteers,
    updateDayCenterVolunteer
} from "../../services/dayCenterVolunteerService";

const TAB_VOLUNTEERS = "volunteers";
const TAB_REQUESTS = "requests";

const SUMMARY_ICONS = {
    active: UserCheck,
    inactive: UserX,
    pending: Clock
};

function ManageDayCenterVolunteers({ onNavigate }) {
    const [activeTab, setActiveTab] = useState(TAB_VOLUNTEERS);
    const [refreshKey, setRefreshKey] = useState(0);
    const [overview, setOverview] = useState({
        active: 0,
        inactive: 0,
        pending: 0
    });
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [detailsVolunteer, setDetailsVolunteer] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const showSuccess = useCallback((text) => {
        if (text) {
            setFeedback({ type: "success", text });
        }
    }, []);

    const showError = useCallback((text) => {
        if (text) {
            setFeedback({ type: "error", text });
        }
    }, []);

    const loadOverview = useCallback(async () => {
        try {
            const [volunteers, pendingRequests] = await Promise.all([
                getDayCenterVolunteers(),
                getPendingDayCenterVolunteerRequests()
            ]);

            const active = volunteers.filter(
                (volunteer) => volunteer.is_active !== false
            ).length;
            const inactive = volunteers.filter(
                (volunteer) => volunteer.is_active === false
            ).length;

            setOverview({
                active,
                inactive,
                pending: pendingRequests.length
            });
        } catch (loadError) {
            console.error(loadError);
        }
    }, []);

    useEffect(() => {
        loadOverview();
    }, [loadOverview, refreshKey]);

    const handleDataUpdated = useCallback(
        (result) => {
            if (result?.successMessage) {
                showSuccess(result.successMessage);
            }

            setSelectedVolunteer(null);
            setDetailsVolunteer(null);
            setRefreshKey((current) => current + 1);
        },
        [showSuccess]
    );

    function handleAddClick() {
        setSelectedVolunteer(null);
        setShowCreateModal(true);
    }

    function handleEditClick(volunteer) {
        setDetailsVolunteer(null);
        setSelectedVolunteer(volunteer);
        setShowCreateModal(true);
    }

    function handleCloseForm() {
        if (isSubmitting) {
            return;
        }

        setShowCreateModal(false);
        setSelectedVolunteer(null);
    }

    async function handleFormSubmit(formData) {
        setIsSubmitting(true);

        try {
            if (selectedVolunteer?.id) {
                await updateDayCenterVolunteer(selectedVolunteer.id, formData);
                showSuccess("פרטי המתנדב/ת עודכנו בהצלחה");
            } else {
                await addDayCenterVolunteer(formData);
                showSuccess("המתנדב/ת נוסף/ה בהצלחה");
            }

            setShowCreateModal(false);
            setSelectedVolunteer(null);
            setRefreshKey((current) => current + 1);
        } catch (submitError) {
            console.error(submitError);
            showError(
                selectedVolunteer
                    ? "שגיאה בעדכון המתנדב/ת"
                    : "שגיאה בהוספת המתנדב/ת"
            );
            throw submitError;
        } finally {
            setIsSubmitting(false);
        }
    }

    const summaryItems = [
        { key: "active", label: "פעילים", value: overview.active },
        { key: "inactive", label: "לא פעילים", value: overview.inactive },
        { key: "pending", label: "בקשות ממתינות", value: overview.pending }
    ];

    return (
        <div
            className="day-center-volunteers-mgmt-page list-mgmt-page"
            dir="rtl"
        >
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

            <div className="staff-container">
                <header className="list-mgmt-page__header">
                    <div className="list-mgmt-page__header-main">
                        <h1 className="list-mgmt-page__title">
                            ניהול מתנדבי מרכז יום
                        </h1>
                        <p className="list-mgmt-page__subtitle">
                            ניהול מתנדבים פעילים, לא פעילים ובקשות התנדבות
                        </p>
                    </div>
                    <div className="list-mgmt-page__actions">
                        {activeTab === TAB_VOLUNTEERS ? (
                            <button
                                type="button"
                                className="list-mgmt-page__action"
                                onClick={handleAddClick}
                            >
                                <Plus
                                    className="list-mgmt-page__action-icon"
                                    strokeWidth={2.25}
                                    aria-hidden="true"
                                />
                                <span>הוספת מתנדב</span>
                            </button>
                        ) : null}
                        {onNavigate ? (
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
                                <span className="staff-back-button__label">
                                    חזרה ללוח הבקרה
                                </span>
                            </button>
                        ) : null}
                    </div>
                </header>

                {feedback ? (
                    <p
                        className={`staff-alert staff-alert--${feedback.type}`}
                        role={feedback.type === "error" ? "alert" : "status"}
                    >
                        {feedback.text}
                    </p>
                ) : null}

                <div className="list-mgmt-summary" aria-label="סיכום מתנדבי מרכז יום">
                    {summaryItems.map((item) => {
                        const Icon = SUMMARY_ICONS[item.key] || UserCheck;

                        return (
                            <div key={item.key} className="list-mgmt-summary__item">
                                <span
                                    className="list-mgmt-summary__icon"
                                    aria-hidden="true"
                                >
                                    <Icon
                                        className="list-mgmt-summary__icon-glyph"
                                        strokeWidth={2}
                                    />
                                </span>
                                <span className="list-mgmt-summary__value">
                                    {item.value}
                                </span>
                                <span className="list-mgmt-summary__label">
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div
                    className="day-center-volunteers-mgmt-tabs"
                    role="tablist"
                    aria-label="ניהול מתנדבי מרכז יום"
                >
                    <button
                        type="button"
                        role="tab"
                        id="day-center-volunteers-tab-volunteers"
                        aria-selected={activeTab === TAB_VOLUNTEERS}
                        aria-controls="day-center-volunteers-panel-volunteers"
                        className={`day-center-volunteers-mgmt-tabs__tab${
                            activeTab === TAB_VOLUNTEERS
                                ? " day-center-volunteers-mgmt-tabs__tab--active"
                                : ""
                        }`}
                        onClick={() => setActiveTab(TAB_VOLUNTEERS)}
                    >
                        מתנדבים
                    </button>
                    <button
                        type="button"
                        role="tab"
                        id="day-center-volunteers-tab-requests"
                        aria-selected={activeTab === TAB_REQUESTS}
                        aria-controls="day-center-volunteers-panel-requests"
                        className={`day-center-volunteers-mgmt-tabs__tab${
                            activeTab === TAB_REQUESTS
                                ? " day-center-volunteers-mgmt-tabs__tab--active"
                                : ""
                        }`}
                        onClick={() => setActiveTab(TAB_REQUESTS)}
                    >
                        בקשות
                        {overview.pending > 0 ? (
                            <span className="day-center-volunteers-mgmt-tabs__count">
                                {overview.pending}
                            </span>
                        ) : null}
                    </button>
                </div>

                {activeTab === TAB_VOLUNTEERS ? (
                    <div
                        role="tabpanel"
                        id="day-center-volunteers-panel-volunteers"
                        aria-labelledby="day-center-volunteers-tab-volunteers"
                    >
                        <DayCenterVolunteersList
                            refreshKey={refreshKey}
                            onEditVolunteer={handleEditClick}
                            onViewDetails={setDetailsVolunteer}
                            onVolunteerUpdated={handleDataUpdated}
                            onShowError={showError}
                        />
                    </div>
                ) : (
                    <div
                        role="tabpanel"
                        id="day-center-volunteers-panel-requests"
                        aria-labelledby="day-center-volunteers-tab-requests"
                    >
                        <DayCenterVolunteerRequestsList
                            refreshKey={refreshKey}
                            onRequestUpdated={handleDataUpdated}
                            onShowError={showError}
                        />
                    </div>
                )}
            </div>

            <DayCenterVolunteerDetailsModal
                volunteer={detailsVolunteer}
                onClose={() => setDetailsVolunteer(null)}
                onEdit={(volunteer) => {
                    setDetailsVolunteer(null);
                    setSelectedVolunteer(volunteer);
                    setShowCreateModal(true);
                }}
                onVolunteerUpdated={handleDataUpdated}
                onShowError={showError}
            />

            <VolunteerForm
                isOpen={showCreateModal}
                volunteer={selectedVolunteer}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

export default ManageDayCenterVolunteers;
