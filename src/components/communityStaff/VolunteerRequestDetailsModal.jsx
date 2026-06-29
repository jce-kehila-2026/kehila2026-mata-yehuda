import { useState } from "react";
import {
  CommunityStaffDetailItem,
  CommunityStaffDetailsModal,
} from "./CommunityStaffListUi.jsx";
import CommunityStaffConfirmModal from "./CommunityStaffConfirmModal.jsx";

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

const CONFIRM_CONFIG = {
  approve: {
    message: "לאשר את המתנדב/ה?",
    confirmLabel: "אישור",
  },
  reject: {
    message: "לדחות את בקשת ההתנדבות?",
    confirmLabel: "דחייה",
  },
  restore: {
    message: "לשחזר את הבקשה לרשימת הבקשות הממתינות?",
    confirmLabel: "שחזור",
  },
  delete: {
    message: "למחוק לצמיתות את בקשת ההתנדבות? לא ניתן לשחזר פעולה זו.",
    confirmLabel: "מחיקה לצמיתות",
  },
};

function VolunteerRequestDetailsModal({
  volunteer,
  onClose,
  onApprove,
  isApproving = false,
  onReject,
  isRejecting = false,
  onRestore,
  isRestoring = false,
  onDelete,
  isDeleting = false,
}) {
  const [confirmAction, setConfirmAction] = useState(null);

  if (!volunteer) {
    return null;
  }

  const servicesDisplay = formatList(volunteer.help_types ?? volunteer.services);
  const servicesText =
    volunteer.otherService && servicesDisplay !== "—"
      ? `${servicesDisplay}, ${volunteer.otherService}`
      : volunteer.otherService || servicesDisplay;

  const busy = isApproving || isRejecting || isRestoring || isDeleting;

  const handleConfirm = () => {
    if (confirmAction === "approve") {
      onApprove?.(volunteer.id);
    } else if (confirmAction === "reject") {
      onReject?.(volunteer.id);
    } else if (confirmAction === "restore") {
      onRestore?.(volunteer.id);
    } else if (confirmAction === "delete") {
      onDelete?.(volunteer.id);
    }

    setConfirmAction(null);
  };

  const activeConfirm = confirmAction ? CONFIRM_CONFIG[confirmAction] : null;

  return (
    <>
      <CommunityStaffDetailsModal
        title="פרטי בקשת התנדבות"
        titleId="volunteer-request-details-title"
        onClose={onClose}
        footer={
          <>
            {onRestore ? (
              <button
                type="button"
                className="community-volunteer-requests__approve-btn"
                onClick={() => setConfirmAction("restore")}
                disabled={busy}
              >
                {isRestoring ? "משחזר..." : "שחזור בקשה"}
              </button>
            ) : null}

            {onApprove ? (
              <button
                type="button"
                className="community-volunteer-requests__approve-btn"
                onClick={() => setConfirmAction("approve")}
                disabled={busy}
              >
                {isApproving ? "שומר..." : "אישור / שמירת מתנדב"}
              </button>
            ) : null}

            {onReject ? (
              <button
                type="button"
                className="community-volunteer-requests__reject-btn"
                onClick={() => setConfirmAction("reject")}
                disabled={busy}
              >
                {isRejecting ? "דוחה..." : "דחיית בקשה"}
              </button>
            ) : null}

            {onDelete ? (
              <button
                type="button"
                className="community-volunteer-requests__reject-btn"
                onClick={() => setConfirmAction("delete")}
                disabled={busy}
              >
                {isDeleting ? "מוחק..." : "מחיקה לצמיתות"}
              </button>
            ) : null}
          </>
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

      <CommunityStaffConfirmModal
        message={activeConfirm?.message || null}
        confirmLabel={activeConfirm?.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        confirming={busy}
      />
    </>
  );
}

export default VolunteerRequestDetailsModal;
