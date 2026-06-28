import { useEffect, useState } from "react";
import { useFcmTokenRegistrationContext } from "./FcmTokenRegistrationProvider";
import { getStoredFcmToken } from "../../services/staffManegmentServices/notificationTokenService";
import "../../styles/notificationOptInFields.css";

const PERMISSION_DENIED_MESSAGE =
    "לא ניתן להפעיל הודעות כי לא ניתנה הרשאה בדפדפן. יש לאפשר הודעות בהגדרות הדפדפן עבור אתר זה ולנסות שוב.";

const PERMISSION_NOT_GRANTED_MESSAGE =
    "לא ניתן להפעיל הודעות כי לא ניתנה הרשאה בדפדפן.";

const SUCCESS_MESSAGE = "הודעות הופעלו בהצלחה.";

function getNotificationPermission() {
    if (typeof Notification === "undefined") {
        return "unsupported";
    }

    return Notification.permission;
}

function isNotificationsAlreadyEnabled(token) {
    const hasToken = Boolean(token || getStoredFcmToken());
    return hasToken && getNotificationPermission() === "granted";
}

async function requestPermissionInUserGesture() {
    if (!("Notification" in window)) {
        return "unsupported";
    }

    const permission = Notification.permission;

    if (permission !== "default") {
        return permission;
    }

    return Notification.requestPermission();
}

function NotificationOptInFields({ className = "" }) {
    const { token, requestNotificationPermission } =
        useFcmTokenRegistrationContext();

    const [wantsNotifications, setWantsNotifications] = useState(false);
    const [activationSuccess, setActivationSuccess] = useState(false);
    const [activating, setActivating] = useState(false);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        if (isNotificationsAlreadyEnabled(token)) {
            setWantsNotifications(true);
        }
    }, [token]);

    const rootClassName = ["notification-opt-in", className]
        .filter(Boolean)
        .join(" ");

    async function handleCheckboxChange(event) {
        const checked = event.target.checked;

        if (!checked) {
            setWantsNotifications(false);
            setActivationSuccess(false);
            setLocalError("");
            return;
        }

        setLocalError("");

        if (isNotificationsAlreadyEnabled(token)) {
            setWantsNotifications(true);
            setActivationSuccess(false);
            return;
        }

        if (getNotificationPermission() === "denied") {
            setWantsNotifications(false);
            setLocalError(PERMISSION_DENIED_MESSAGE);
            return;
        }

        if (typeof requestNotificationPermission !== "function") {
            console.error(
                "Notification opt-in: requestNotificationPermission is not available from context"
            );
            setWantsNotifications(false);
            setLocalError("שגיאה בהפעלת הודעות. נסו לרענן את הדף.");
            return;
        }

        setWantsNotifications(true);
        setActivationSuccess(false);
        setActivating(true);

        try {
            const permission = await requestPermissionInUserGesture();

            if (permission === "denied") {
                setWantsNotifications(false);
                setLocalError(PERMISSION_DENIED_MESSAGE);
                return;
            }

            if (permission !== "granted") {
                setWantsNotifications(false);
                setLocalError(PERMISSION_NOT_GRANTED_MESSAGE);
                return;
            }

            const nextToken = await requestNotificationPermission("", {
                skipPermissionPrompt: true
            });

            if (nextToken) {
                setActivationSuccess(true);
                return;
            }

            setWantsNotifications(false);

            if (getNotificationPermission() === "denied") {
                setLocalError(PERMISSION_DENIED_MESSAGE);
            } else {
                setLocalError("לא ניתן להפעיל הודעות כרגע. נסו שוב.");
            }
        } catch (activateError) {
            console.error("Notification opt-in activation failed", activateError);
            setWantsNotifications(false);

            if (getNotificationPermission() === "denied") {
                setLocalError(PERMISSION_DENIED_MESSAGE);
            } else {
                setLocalError(
                    activateError?.message ||
                        "לא ניתן להפעיל הודעות כרגע. נסו שוב."
                );
            }
        } finally {
            setActivating(false);
        }
    }

    return (
        <div className={rootClassName}>
            <label className="notification-opt-in__label">
                <input
                    type="checkbox"
                    className="notification-opt-in__checkbox"
                    checked={wantsNotifications}
                    onChange={handleCheckboxChange}
                    disabled={activating}
                />
                <span>
                    {activating
                        ? "מפעיל הודעות..."
                        : "אני רוצה לקבל עדכונים והודעות מהעמותה"}
                </span>
            </label>

            {activationSuccess && (
                <p className="notification-opt-in__success" role="status">
                    {SUCCESS_MESSAGE}
                </p>
            )}

            {localError && (
                <p className="notification-opt-in__error" role="alert">
                    {localError}
                </p>
            )}
        </div>
    );
}

export default NotificationOptInFields;
