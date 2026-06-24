import { useState } from "react";
import CommunityStaffConfirmModal from "../communityStaff/CommunityStaffConfirmModal.jsx";
import { AdminTableDeleteButton } from "../admin/AdminTableActions.jsx";
import ReactivateVolunteerButton from "../admin/ReactivateVolunteerButton.jsx";
import {
    CommunityStaffActiveBadge,
    CommunityStaffDetailItem,
    CommunityStaffDetailsModal
} from "../communityStaff/CommunityStaffListUi.jsx";
import {
    deactivateDayCenterVolunteer,
    getVolunteerDisplayName,
    reactivateDayCenterVolunteer
} from "../../services/dayCenterVolunteerService";

function DayCenterVolunteerDetailsModal({
    volunteer,
    onClose,
    onEdit,
    onVolunteerUpdated,
    onShowError
}) {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    if (!volunteer) {
        return null;
    }

    const isActive = volunteer.is_active !== false;

    async function handleConfirmStatusChange() {
        if (!pendingAction) {
            return;
        }

        setUpdatingStatus(true);

        try {
            if (pendingAction.isActive) {
                await reactivateDayCenterVolunteer(volunteer.id);
                onVolunteerUpdated?.({
                    successMessage: "המתנדב הופעל בהצלחה"
                });
            } else {
                await deactivateDayCenterVolunteer(volunteer.id);
                onVolunteerUpdated?.({
                    successMessage: "המתנדב הושבת בהצלחה"
                });
            }

            setPendingAction(null);
            onClose?.();
        } catch (error) {
            console.error(error);
            onShowError?.("אירעה שגיאה. נסו שוב.");
        } finally {
            setUpdatingStatus(false);
        }
    }

    return (
        <>
            <CommunityStaffDetailsModal
                title={`פרטי מתנדב/ת – ${getVolunteerDisplayName(volunteer)}`}
                titleId="day-center-volunteer-details-title"
                onClose={onClose}
                footer={
                    <>
                        <button
                            type="button"
                            className="community-volunteers-mgmt__action-btn"
                            onClick={() => onEdit?.(volunteer)}
                        >
                            עריכת פרטים
                        </button>

                        {isActive ? (
                            <AdminTableDeleteButton
                                onClick={() => setPendingAction({ isActive: false })}
                                disabled={updatingStatus}
                                label="השבתת מתנדב/ת"
                            />
                        ) : (
                            <ReactivateVolunteerButton
                                onClick={() => setPendingAction({ isActive: true })}
                                disabled={updatingStatus}
                            />
                        )}
                    </>
                }
            >
                <div className="day-center-volunteer-details__status-row">
                    <span className="day-center-volunteer-details__status-label">סטטוס</span>
                    <CommunityStaffActiveBadge isActive={isActive} />
                </div>

                <dl className="community-staff-details-grid">
                    <CommunityStaffDetailItem
                        label="שם מלא"
                        value={getVolunteerDisplayName(volunteer)}
                    />
                    <CommunityStaffDetailItem label="טלפון" value={volunteer.phone} />
                    {volunteer.id_number ? (
                        <CommunityStaffDetailItem
                            label="תעודת זהות"
                            value={volunteer.id_number}
                        />
                    ) : null}
                    {volunteer.about_me?.trim() ? (
                        <CommunityStaffDetailItem
                            label="ספר/י על עצמך"
                            value={volunteer.about_me}
                        />
                    ) : null}
                </dl>
            </CommunityStaffDetailsModal>

            <CommunityStaffConfirmModal
                message={
                    pendingAction
                        ? pendingAction.isActive
                            ? "להפעיל את המתנדב/ת מחדש?"
                            : "להשבית את המתנדב/ת?"
                        : null
                }
                onConfirm={handleConfirmStatusChange}
                onCancel={() => setPendingAction(null)}
                confirming={updatingStatus}
            />
        </>
    );
}

export default DayCenterVolunteerDetailsModal;
