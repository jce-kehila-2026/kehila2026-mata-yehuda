import {
  CommunityStaffDetailItem,
  CommunityStaffDetailsModal,
} from "./CommunityStaffListUi.jsx";

function ActiveVolunteerMatchSummaryModal({ match, onClose, onManage }) {
  if (!match) {
    return null;
  }

  return (
    <CommunityStaffDetailsModal
      title="פרטי התאמה"
      titleId="active-match-summary-title"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="community-active-matches__action-btn"
          onClick={() => onManage(match)}
        >
          ניהול התאמה
        </button>
      }
    >
      <section className="community-staff-details-section">
        <h3 className="community-staff-details-section-title">משתתף/ת</h3>
        <dl className="community-staff-details-grid">
          <CommunityStaffDetailItem
            label="שם מלא"
            value={match.participantFullName}
          />
          <CommunityStaffDetailItem
            label="טלפון"
            value={match.participantPhone}
          />
          <CommunityStaffDetailItem
            label="תעודת זהות"
            value={match.participantIdNumber}
          />
        </dl>
      </section>

      <section className="community-staff-details-section">
        <h3 className="community-staff-details-section-title">מתנדב/ת</h3>
        <dl className="community-staff-details-grid">
          <CommunityStaffDetailItem
            label="שם מלא"
            value={match.volunteerFullName}
          />
          <CommunityStaffDetailItem
            label="טלפון"
            value={match.volunteerPhone}
          />
        </dl>
      </section>

      <section className="community-staff-details-section">
        <h3 className="community-staff-details-section-title">פרטי ההתאמה</h3>
        <dl className="community-staff-details-grid">
          <CommunityStaffDetailItem label="ציון" value={match.matchScore} />
          <CommunityStaffDetailItem
            label="תאריך התאמה"
            value={match.matchedAtDisplay}
          />
          <CommunityStaffDetailItem
            label="שפות משותפות"
            value={match.matchedLanguagesDisplay}
          />
          <CommunityStaffDetailItem
            label="סוגי עזרה משותפים"
            value={match.matchedHelpTypesDisplay}
          />
          <CommunityStaffDetailItem
            label="הערות"
            value={match.notesDisplay}
          />
        </dl>
      </section>
    </CommunityStaffDetailsModal>
  );
}

export default ActiveVolunteerMatchSummaryModal;
