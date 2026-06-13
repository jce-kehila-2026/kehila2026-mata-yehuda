import { useState } from "react";
import { updateCommunityMemberSubscriptionStatus } from "../../services/communityStaff/communityStaffService";

function getStatusLabel(status) {
  if (status === "active") {
    return "פעיל";
  }

  if (status === "inactive") {
    return "לא פעיל";
  }

  return status || "—";
}

function getGenderLabel(gender) {
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

function formatBirthDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("he-IL");
}

function formatBoolean(value) {
  if (value === true) {
    return "כן";
  }

  if (value === false) {
    return "לא";
  }

  return "—";
}

function DetailItem({ label, value }) {
  return (
    <div className="community-members__detail-item">
      <dt className="community-members__detail-label">{label}</dt>
      <dd className="community-members__detail-value">{value || "—"}</dd>
    </div>
  );
}

function CommunityMemberDetailsModal({
  member,
  onClose,
  onEdit,
  onViewHistory,
  onMemberUpdated,
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!member) {
    return null;
  }

  const participant = member.participant || {};

  const handleStatusChange = async (nextStatus) => {
    const confirmMessage =
      nextStatus === "inactive"
        ? "להשבית את חברות המשתתף/ת בקהילה?"
        : "להפעיל מחדש את חברות המשתתף/ת בקהילה?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUpdatingStatus(true);

    try {
      await updateCommunityMemberSubscriptionStatus(member.id, nextStatus);
      onMemberUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update member subscription status:", error);
      window.alert("אירעה שגיאה בעדכון סטטוס החברות");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div
      className="community-members__modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="community-members__modal community-members__details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="community-members__modal-header">
          <h2 id="member-details-title">פרטי חבר/ת קהילה</h2>
          <button
            type="button"
            className="community-members__modal-close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <div className="community-members__details-body">
          <section className="community-members__details-section">
            <h3 className="community-members__details-section-title">פרטי משתתף/ת</h3>
            <dl className="community-members__details-grid">
              <DetailItem label="שם מלא" value={member.fullNameDisplay} />
              <DetailItem label="תעודת זהות" value={participant.id_number} />
              <DetailItem label="טלפון" value={participant.phone} />
              <DetailItem label="כתובת" value={participant.address} />
              <DetailItem
                label="תאריך לידה"
                value={formatBirthDate(participant.birth_date)}
              />
              <DetailItem
                label="מספר חירום"
                value={participant.emergency_number}
              />
              <DetailItem
                label="מין"
                value={getGenderLabel(participant.gender)}
              />
              <DetailItem
                label="הסכמה לשיווק"
                value={formatBoolean(participant.marketing_consent)}
              />
              <DetailItem
                label="הערות רפואיות"
                value={participant.medical_notes}
              />
              <DetailItem
                label="מגבלות ניידות"
                value={participant.mobility_limitations}
              />
            </dl>
          </section>

          <section className="community-members__details-section">
            <h3 className="community-members__details-section-title">פרטי מנוי</h3>
            <dl className="community-members__details-grid">
              <DetailItem
                label="סטטוס חברות"
                value={getStatusLabel(member.status)}
              />
              <DetailItem
                label="מחיר חודשי"
                value={member.monthlyPriceDisplay}
              />
              <DetailItem
                label="שירותים מבוקשים"
                value={member.requestedServicesDisplay}
              />
              <DetailItem label="שפות" value={member.languagesDisplay} />
            </dl>
          </section>
        </div>

        <div className="community-members__details-footer">
          <button
            type="button"
            className="community-members__action-btn"
            onClick={() => onEdit(member)}
          >
            עריכת פרטי חבר
          </button>

          <button
            type="button"
            className="community-members__action-btn"
            onClick={() => onViewHistory(member)}
          >
            צפייה בהיסטוריית בקשות
          </button>

          {member.status === "active" && (
            <button
              type="button"
              className="community-members__action-btn community-members__action-btn--warning"
              onClick={() => handleStatusChange("inactive")}
              disabled={updatingStatus}
            >
              {updatingStatus ? "מעדכן..." : "השבתת חברות"}
            </button>
          )}

          {member.status === "inactive" && (
            <button
              type="button"
              className="community-members__action-btn"
              onClick={() => handleStatusChange("active")}
              disabled={updatingStatus}
            >
              {updatingStatus ? "מעדכן..." : "הפעלת חברות מחדש"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommunityMemberDetailsModal;
