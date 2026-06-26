import { useState } from "react";
import { X } from "lucide-react";
import StaffConfirmModal from "../staff/StaffConfirmModal";
import {
    deactivateDayCenterVolunteer,
    getVolunteerDisplayName,
    reactivateDayCenterVolunteer
} from "../../services/dayCenterVolunteerService";

function DetailRow({ label, value }) {
    return (
        <div className="day-center-volunteers-request-details__row">
            <dt>{label}</dt>
            <dd>{value || "—"}</dd>
        </div>
    );
}

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
                onVolunteerUpdated?.({ successMessage: "המתנדב הופעל בהצלחה" });
            } else {
                await deactivateDayCenterVolunteer(volunteer.id);
                onVolunteerUpdated?.({ successMessage: "המתנדב הושבת בהצלחה" });
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
            <div
                className="day-center-volunteers-modal-overlay"
                onClick={updatingStatus ? undefined : onClose}
                role="presentation"
            >
                <div
                    className="day-center-volunteers-modal day-center-volunteers-modal--details"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="day-center-volunteer-details-title"
                    onClick={(event) => event.stopPropagation()}
                >
                    <button
                        type="button"
                        className="day-center-volunteers-modal__close"
                        onClick={onClose}
                        aria-label="סגירת חלון"
                        disabled={updatingStatus}
                    >
                        <X strokeWidth={2} aria-hidden="true" />
                    </button>

                    <div className="day-center-volunteers-modal__body">
                        <div className="day-center-volunteers-modal__header">
                            <h2
                                id="day-center-volunteer-details-title"
                                className="day-center-volunteers-modal__title"
                            >
                                פרטי מתנדב/ת – {getVolunteerDisplayName(volunteer)}
                            </h2>
                        </div>

                        <div className="day-center-volunteers-request-details">
                            <div className="day-center-volunteer-details__status-row">
                                <span className="day-center-volunteer-details__status-label">
                                    סטטוס
                                </span>
                                <span
                                    className={`day-center-volunteers-list__status day-center-volunteers-list__status--${
                                        isActive ? "active" : "inactive"
                                    }`}
                                >
                                    {isActive ? "פעיל" : "לא פעיל"}
                                </span>
                            </div>

                            <dl className="day-center-volunteers-request-details__grid">
                                <DetailRow
                                    label="שם מלא"
                                    value={getVolunteerDisplayName(volunteer)}
                                />
                                <DetailRow label="טלפון" value={volunteer.phone} />
                                {volunteer.id_number ? (
                                    <DetailRow
                                        label="תעודת זהות"
                                        value={volunteer.id_number}
                                    />
                                ) : null}
                                {volunteer.about_me?.trim() ? (
                                    <DetailRow
                                        label="ספר/י על עצמך"
                                        value={volunteer.about_me}
                                    />
                                ) : null}
                            </dl>

                            <div className="day-center-volunteers-request-details__actions">
                                <button
                                    type="button"
                                    className="staff-button staff-button--secondary"
                                    onClick={() => onEdit?.(volunteer)}
                                    disabled={updatingStatus}
                                >
                                    עריכת פרטים
                                </button>
                                {isActive ? (
                                    <button
                                        type="button"
                                        className="staff-button staff-button--secondary day-center-volunteers-request-details__reject-btn"
                                        onClick={() =>
                                            setPendingAction({ isActive: false })
                                        }
                                        disabled={updatingStatus}
                                    >
                                        השבתת מתנדב/ת
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="staff-button day-center-volunteers-request-details__approve-btn"
                                        onClick={() =>
                                            setPendingAction({ isActive: true })
                                        }
                                        disabled={updatingStatus}
                                    >
                                        הפעלה מחדש
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StaffConfirmModal
                message={
                    pendingAction
                        ? pendingAction.isActive
                            ? "להפעיל את המתנדב/ת מחדש?"
                            : "להשבית את המתנדב/ת?"
                        : ""
                }
                confirmLabel={pendingAction?.isActive ? "הפעלה מחדש" : "השבתה"}
                confirming={updatingStatus}
                onConfirm={handleConfirmStatusChange}
                onCancel={() => setPendingAction(null)}
            />
        </>
    );
}

export default DayCenterVolunteerDetailsModal;
