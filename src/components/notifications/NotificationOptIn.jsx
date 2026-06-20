import { useEffect, useState } from "react";
import { useFcmTokenRegistrationContext } from "./FcmTokenRegistrationProvider";
import {
    markNotificationOptInSeen,
    shouldShowNotificationOptInModal
} from "../../services/staffManegmentServices/notificationTokenService";
import "../../styles/notificationOptInModal.css";

function NotificationOptIn() {
    const [isOpen, setIsOpen] = useState(() => shouldShowNotificationOptInModal());
    const [submitting, setSubmitting] = useState(false);
    const { permission, token, requestNotificationPermission } =
        useFcmTokenRegistrationContext();

    useEffect(() => {
        if (
            permission === "granted" ||
            permission === "denied" ||
            token
        ) {
            markNotificationOptInSeen();
            setIsOpen(false);
        }
    }, [permission, token]);

    if (!isOpen) {
        return null;
    }

    function dismissOptIn() {
        markNotificationOptInSeen();
        setIsOpen(false);
    }

    async function handleApprove() {
        dismissOptIn();
        setSubmitting(true);

        try {
            await requestNotificationPermission("");
        } catch (requestError) {
            console.error("[fcm] Opt-in flow failed", requestError);
        } finally {
            setSubmitting(false);
        }
    }

    function handleLater() {
        dismissOptIn();
    }

    return (
        <div
            className="notification-opt-in-modal"
            dir="rtl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="notification-opt-in-title"
            aria-describedby="notification-opt-in-body"
        >
            <button
                type="button"
                className="notification-opt-in-modal__overlay"
                aria-label="סגירה"
                onClick={handleLater}
            />

            <div className="notification-opt-in-modal__dialog">
                <button
                    type="button"
                    className="notification-opt-in-modal__close"
                    aria-label="סגירה"
                    onClick={handleLater}
                >
                    ×
                </button>

                <h2
                    id="notification-opt-in-title"
                    className="notification-opt-in-modal__title"
                >
                    קבלת התראות
                </h2>

                <p
                    id="notification-opt-in-body"
                    className="notification-opt-in-modal__body"
                >
                    האם תרצה/י לקבל עדכונים ותזכורות ישירות לדפדפן?
                </p>

                <div className="notification-opt-in-modal__actions">
                    <button
                        type="button"
                        className="notification-opt-in-modal__approve"
                        onClick={handleApprove}
                        disabled={submitting}
                    >
                        {submitting ? "מפעיל..." : "אישור קבלת התראות"}
                    </button>
                    <button
                        type="button"
                        className="notification-opt-in-modal__later"
                        onClick={handleLater}
                        disabled={submitting}
                    >
                        לא עכשיו
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotificationOptIn;
