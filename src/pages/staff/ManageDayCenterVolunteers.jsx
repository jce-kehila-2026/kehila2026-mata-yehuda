import { useCallback, useEffect, useState } from "react";
import CommunityStaffMessage, {
    useCommunityStaffMessage
} from "../../components/communityStaff/CommunityStaffMessage.jsx";
import { CommunityStaffStatusOverview } from "../../components/communityStaff/CommunityStaffListUi.jsx";
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
import "../../styles/communityStaff/CommunityStaffDashboard.css";

const TAB_VOLUNTEERS = "volunteers";
const TAB_REQUESTS = "requests";

function ManageDayCenterVolunteers() {
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
    const { message, showSuccess, showError, clearMessage } =
        useCommunityStaffMessage();

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

    return (
        <div
            className="day-center-volunteers-mgmt-page community-volunteers-mgmt-page"
            dir="rtl"
        >
            <header className="community-volunteers-mgmt-page__header community-staff-page-header">
                <div className="community-staff-page-header__main">
                    <h1 className="community-volunteers-mgmt-page__title page-title">
                        ניהול מתנדבי מרכז יום
                    </h1>
                    <p className="community-staff-page-subtitle">
                        ניהול מתנדבים פעילים, לא פעילים ובקשות התנדבות
                    </p>
                </div>
                {activeTab === TAB_VOLUNTEERS ? (
                    <button
                        type="button"
                        className="community-staff-page-header__action"
                        onClick={handleAddClick}
                    >
                        הוספת מתנדב
                    </button>
                ) : null}
            </header>

            <CommunityStaffMessage message={message} onDismiss={clearMessage} />

            <CommunityStaffStatusOverview
                items={[
                    { value: overview.active, label: "פעילים", tone: "active" },
                    {
                        value: overview.inactive,
                        label: "לא פעילים",
                        tone: "inactive"
                    },
                    {
                        value: overview.pending,
                        label: "בקשות ממתינות",
                        tone: "pending"
                    }
                ]}
            />

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
