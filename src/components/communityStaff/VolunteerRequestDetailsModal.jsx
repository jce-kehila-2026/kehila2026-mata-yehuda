import {
  CommunityStaffDetailItem,
  CommunityStaffDetailsModal,
} from "./CommunityStaffListUi.jsx";

function formatList(value) {
  if (!value) {
    return "—";
  }

  if (Array.isArray(value)) {
    const items = value.filter(Boolean);
    return items.length > 0 ? items.join(", ") : "—";
  }

  return String(value);
}

function formatGender(gender) {
  if (gender === "male") {
    return "זכר";
  }

  if (gender === "female") {
    return "נקבה";
  }

  if (gender === "other") {
    return "אחר";
  }

  return gender || "—";
}

function VolunteerRequestDetailsModal({
  volunteer,
  onClose,
  onApprove,
  isApproving,
}) {
  if (!volunteer) {
    return null;
  }

  const servicesDisplay = formatList(volunteer.help_types ?? volunteer.services);
  const servicesText =
    volunteer.otherService && servicesDisplay !== "—"
      ? `${servicesDisplay}, ${volunteer.otherService}`
      : volunteer.otherService || servicesDisplay;

  return (
    <CommunityStaffDetailsModal
      title="פרטי בקשת התנדבות"
      titleId="volunteer-request-details-title"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="community-volunteer-requests__approve-btn"
          onClick={() => onApprove(volunteer.id)}
          disabled={isApproving}
        >
          {isApproving ? "שומר..." : "אישור / שמירת מתנדב"}
        </button>
      }
    >
      <dl className="community-staff-details-grid">
        <CommunityStaffDetailItem
          label="שם מלא"
          value={volunteer.fullNameDisplay}
        />
        <CommunityStaffDetailItem
          label="תעודת זהות"
          value={volunteer.volunteerId || volunteer.id}
        />
        <CommunityStaffDetailItem label="טלפון" value={volunteer.phone} />
        <CommunityStaffDetailItem
          label="מין"
          value={formatGender(volunteer.gender)}
        />
        <CommunityStaffDetailItem
          label="תאריך לידה"
          value={volunteer.birthDate}
        />
        <CommunityStaffDetailItem label="כתובת" value={volunteer.address} />
        <CommunityStaffDetailItem label="סטטוס" value={volunteer.status} />
        <CommunityStaffDetailItem label="שירותים" value={servicesText} />
        <CommunityStaffDetailItem
          label="שפות"
          value={volunteer.languagesDisplay}
        />
        <CommunityStaffDetailItem label="אודות" value={volunteer.about} />
        <CommunityStaffDetailItem label="הערות" value={volunteer.notes} />
      </dl>
    </CommunityStaffDetailsModal>
  );
}

export default VolunteerRequestDetailsModal;
