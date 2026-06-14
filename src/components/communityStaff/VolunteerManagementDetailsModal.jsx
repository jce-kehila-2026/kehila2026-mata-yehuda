import { useState } from "react";
import { updateVolunteerActiveStatus } from "../../services/communityStaff/communityStaffService";
import { AdminTableDeleteButton } from "../admin/AdminTableActions.jsx";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";
import {
  CommunityStaffDetailItem,
  CommunityStaffDetailsModal,
} from "./CommunityStaffListUi.jsx";

function VolunteerManagementDetailsModal({
  volunteer,
  onClose,
  onEdit,
  onVolunteerUpdated,
  onShowError,
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  if (!volunteer) {
    return null;
  }

  const getConfirmMessage = (isActive) =>
    isActive ? "להפעיל את המתנדב/ה מחדש?" : "להשבית את המתנדב/ה?";

  const getSuccessMessage = (isActive) =>
    isActive ? "המתנדב הופעל בהצלחה" : "המתנדב הושבת בהצלחה";

  const handleConfirmStatusChange = async () => {
    if (!pendingAction) {
      return;
    }

    const { isActive } = pendingAction;
    setUpdatingStatus(true);

    try {
      await updateVolunteerActiveStatus(volunteer.id, isActive);
      onVolunteerUpdated({
        successMessage: getSuccessMessage(isActive),
      });
      setPendingAction(null);
      onClose();
    } catch (error) {
      console.error("Failed to update volunteer active status:", error);
      onShowError?.("אירעה שגיאה. נסה שוב.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <>
      <CommunityStaffDetailsModal
        title="פרטי מתנדב/ת"
        titleId="volunteer-mgmt-details-title"
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              className="community-volunteers-mgmt__action-btn"
              onClick={() => onEdit(volunteer)}
            >
              עריכת פרטים
            </button>

            {volunteer.is_active === true ? (
              <AdminTableDeleteButton
                onClick={() => setPendingAction({ isActive: false })}
                disabled={updatingStatus}
                label="השבתת מתנדב"
              />
            ) : (
              <button
                type="button"
                className="community-volunteers-mgmt__action-btn"
                onClick={() => setPendingAction({ isActive: true })}
                disabled={updatingStatus}
              >
                הפעלת מתנדב
              </button>
            )}
          </>
        }
      >
        <dl className="community-staff-details-grid">
          <CommunityStaffDetailItem
            label="שם מלא"
            value={volunteer.fullNameDisplay}
          />
          <CommunityStaffDetailItem
            label="טלפון"
            value={volunteer.phoneDisplay}
          />
          <CommunityStaffDetailItem
            label="כתובת"
            value={volunteer.addressDisplay}
          />
          {volunteer.email?.trim() ? (
            <CommunityStaffDetailItem
              label="אימייל"
              value={volunteer.emailDisplay}
            />
          ) : null}
          <CommunityStaffDetailItem
            label="שפות"
            value={volunteer.languagesDisplay}
          />
          <CommunityStaffDetailItem
            label="סוגי עזרה"
            value={volunteer.helpTypesDisplay}
          />
          <CommunityStaffDetailItem
            label="הערות"
            value={volunteer.notesDisplay}
          />
        </dl>
      </CommunityStaffDetailsModal>

      <CommunityStaffConfirmModal
        message={
          pendingAction ? getConfirmMessage(pendingAction.isActive) : null
        }
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setPendingAction(null)}
        confirming={updatingStatus}
      />
    </>
  );
}

export default VolunteerManagementDetailsModal;
