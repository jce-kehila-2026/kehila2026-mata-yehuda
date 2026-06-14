import {
  CommunityStaffDetailItem,
  CommunityStaffDetailsModal,
} from "./CommunityStaffListUi.jsx";

function getParticipantFullName(participant) {
  if (!participant) {
    return "—";
  }

  const firstName = participant.first_name || "";
  const lastName = participant.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "—";
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "—";
  }

  const date =
    typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : timestamp instanceof Date
        ? timestamp
        : null;

  if (!date) {
    return "—";
  }

  return date.toLocaleString("he-IL");
}

function getServicesDisplay(request) {
  const requestedServices = request.requestedServicesDisplay || "—";

  if (request.otherService && requestedServices !== "—") {
    return `${requestedServices}, ${request.otherService}`;
  }

  return request.otherService || requestedServices;
}

function CommunityJoinRequestDetailsModal({ request, onClose, onCompleteRegistration }) {
  if (!request) {
    return null;
  }

  const participant = request.participant || {};

  return (
    <CommunityStaffDetailsModal
      title="פרטי בקשת הצטרפות"
      titleId="join-request-details-title"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="community-join-requests__complete-btn"
          onClick={() => onCompleteRegistration(request)}
        >
          השלמת רישום
        </button>
      }
    >
      <section className="community-staff-details-section">
        <h3 className="community-staff-details-section-title">פרטי מבקש/ת</h3>
        <dl className="community-staff-details-grid">
          <CommunityStaffDetailItem
            label="שם מלא"
            value={getParticipantFullName(participant)}
          />
          <CommunityStaffDetailItem
            label="תעודת זהות"
            value={participant.id_number}
          />
          <CommunityStaffDetailItem label="טלפון" value={participant.phone} />
          <CommunityStaffDetailItem label="כתובת" value={participant.address} />
        </dl>
      </section>

      <section className="community-staff-details-section">
        <h3 className="community-staff-details-section-title">פרטי הבקשה</h3>
        <dl className="community-staff-details-grid">
          <CommunityStaffDetailItem label="סטטוס" value={request.status} />
          <CommunityStaffDetailItem
            label="תאריך הגשה"
            value={formatDate(request.createdAt)}
          />
          <CommunityStaffDetailItem
            label="שירותים מבוקשים"
            value={getServicesDisplay(request)}
          />
          <CommunityStaffDetailItem
            label="שפות"
            value={request.languagesDisplay}
          />
        </dl>
      </section>
    </CommunityStaffDetailsModal>
  );
}

export default CommunityJoinRequestDetailsModal;
