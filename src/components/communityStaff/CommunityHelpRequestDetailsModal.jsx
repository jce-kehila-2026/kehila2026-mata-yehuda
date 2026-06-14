import {
  CommunityStaffDetailItem,
  CommunityStaffDetailsModal,
} from "./CommunityStaffListUi.jsx";

function formatRequestedHelpTypes(request) {
  const helpTypes = request.requestedHelpTypes ?? request.requestedServices;

  if (!Array.isArray(helpTypes) || helpTypes.length === 0) {
    return "—";
  }

  return helpTypes.join(", ");
}

function CommunityHelpRequestDetailsModal({ request, onClose, onMatch }) {
  if (!request) {
    return null;
  }

  return (
    <CommunityStaffDetailsModal
      title="פרטי בקשת סיוע"
      titleId="help-request-details-title"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="community-help-requests__match-btn"
          onClick={() => onMatch(request)}
        >
          התאמה
        </button>
      }
    >
      <dl className="community-staff-details-grid">
        <CommunityStaffDetailItem
          label="שם מבקש/ת"
          value={request.participantFullName}
        />
        <CommunityStaffDetailItem
          label="תעודת זהות"
          value={request.participantIdNumber}
        />
        <CommunityStaffDetailItem
          label="טלפון"
          value={request.participantPhone}
        />
        <CommunityStaffDetailItem label="סטטוס" value={request.status} />
        <CommunityStaffDetailItem
          label="סוגי עזרה"
          value={formatRequestedHelpTypes(request)}
        />
        <CommunityStaffDetailItem
          label="שפות"
          value={request.languagesDisplay}
        />
        <CommunityStaffDetailItem
          label="תיאור"
          value={request.description}
        />
      </dl>
    </CommunityStaffDetailsModal>
  );
}

export default CommunityHelpRequestDetailsModal;
