import { useState } from "react";
import { updateCommunityMemberSubscriptionStatus } from "../../services/communityStaff/communityStaffService";
import { AdminTableDeleteButton } from "../admin/AdminTableActions.jsx";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";

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
  onShowError,
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  if (!member) {
    return null;
  }

  const participant = member.participant || {};

  const getConfirmMessage = (nextStatus) =>
    nextStatus === "inactive"
      ? "להשבית את חברות המשתתף/ת בקהילה?"
      : "להפעיל מחדש את חברות המשתתף/ת בקהילה?";

  const getSuccessMessage = (nextStatus) =>
    nextStatus === "inactive"
      ? "חברות המשתתף/ת הושבתה בהצלחה"
      : "חברות המשתתף/ת הופעלה מחדש בהצלחה";

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) {
      return;
    }

    setUpdatingStatus(true);

    try {
      await updateCommunityMemberSubscriptionStatus(member.id, pendingStatus);
      onMemberUpdated({
        successMessage: getSuccessMessage(pendingStatus),
      });
      setPendingStatus(null);
      onClose();
    } catch (error) {
      console.error("Failed to update member subscription status:", error);
      onShowError?.("אירעה שגיאה. נסה שוב.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <>
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
              <h3 className="community-members__details-section-title">
                פרטי משתתף/ת
              </h3>
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
              <h3 className="community-members__details-section-title">
                פרטי מנוי
              </h3>
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
              <AdminTableDeleteButton
                onClick={() => setPendingStatus("inactive")}
                disabled={updatingStatus}
                label="השבתת חברות"
              />
            )}

            {member.status === "inactive" && (
              <button
                type="button"
                className="community-members__action-btn"
                onClick={() => setPendingStatus("active")}
                disabled={updatingStatus}
              >
                הפעלת חברות מחדש
              </button>
            )}
          </div>
        </div>
      </div>

      <CommunityStaffConfirmModal
        message={pendingStatus ? getConfirmMessage(pendingStatus) : null}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setPendingStatus(null)}
        confirming={updatingStatus}
      />
    </>
  );
}

export default CommunityMemberDetailsModal;
