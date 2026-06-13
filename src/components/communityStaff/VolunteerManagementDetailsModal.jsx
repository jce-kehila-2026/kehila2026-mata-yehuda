import { useState } from "react";
import { updateVolunteerActiveStatus } from "../../services/communityStaff/communityStaffService";
import {
  CommunityStaffDetailItem,
  CommunityStaffDetailsModal,
} from "./CommunityStaffListUi.jsx";

function VolunteerManagementDetailsModal({
  volunteer,
  onClose,
  onEdit,
  onVolunteerUpdated,
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!volunteer) {
    return null;
  }

  const handleActiveStatusChange = async (isActive) => {
    const confirmMessage = isActive
      ? "להפעיל את המתנדב/ה מחדש?"
      : "להשבית את המתנדב/ה?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUpdatingStatus(true);

    try {
      await updateVolunteerActiveStatus(volunteer.id, isActive);
      onVolunteerUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update volunteer active status:", error);
      window.alert("אירעה שגיאה בעדכון סטטוס המתנדב");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
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
            <button
              type="button"
              className="community-volunteers-mgmt__action-btn community-volunteers-mgmt__action-btn--warning"
              onClick={() => handleActiveStatusChange(false)}
              disabled={updatingStatus}
            >
              {updatingStatus ? "מעדכן..." : "השבתת מתנדב"}
            </button>
          ) : (
            <button
              type="button"
              className="community-volunteers-mgmt__action-btn"
              onClick={() => handleActiveStatusChange(true)}
              disabled={updatingStatus}
            >
              {updatingStatus ? "מעדכן..." : "הפעלת מתנדב"}
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
          label="אימייל"
          value={volunteer.emailDisplay}
        />
        <CommunityStaffDetailItem
          label="סטטוס פעילות"
          value={volunteer.activeStatusDisplay}
        />
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
  );
}

export default VolunteerManagementDetailsModal;
