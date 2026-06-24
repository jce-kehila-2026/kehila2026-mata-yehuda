import { useState } from "react";
import { useFcmTokenRegistrationContext } from "./FcmTokenRegistrationProvider";
import "../../styles/notificationOptInFields.css";

const PERMISSION_DENIED_MESSAGE =
    "הודעות חסומות בדפדפן. יש לאפשר הודעות בהגדרות הדפדפן עבור אתר זה ולנסות שוב.";

function getNotificationPermission() {
    if (typeof Notification === "undefined") {
        return "unsupported";
    }

    return Notification.permission;
}

async function requestPermissionInUserGesture() {
    if (!("Notification" in window)) {
        return "unsupported";
    }

    let permission = Notification.permission;

    if (permission !== "default") {
        return permission;
    }

    return Notification.requestPermission();
}

function NotificationOptInFields({ className = "" }) {
    const [wantsNotifications, setWantsNotifications] = useState(false);
    const [activationSuccess, setActivationSuccess] = useState(false);
    const [activating, setActivating] = useState(false);
    const [localError, setLocalError] = useState("");
    const { error, requestNotificationPermission } =
        useFcmTokenRegistrationContext();

    const displayError = localError || error;
    const rootClassName = ["notification-opt-in", className]
        .filter(Boolean)
        .join(" ");

    function handleCheckboxChange(event) {
        const checked = event.target.checked;
        setWantsNotifications(checked);

        if (!checked) {
            setActivationSuccess(false);
            setLocalError("");
        }
    }

    async function handleActivate(event) {
        event.preventDefault();
        event.stopPropagation();

        const permissionBefore = getNotificationPermission();

        if (permissionBefore === "denied") {
            setLocalError(PERMISSION_DENIED_MESSAGE);
            return;
        }

        if (typeof requestNotificationPermission !== "function") {
            console.error(
                "Notification opt-in: requestNotificationPermission is not available from context"
            );
            setLocalError("שגיאה בהפעלת הודעות. נסו לרענן את הדף.");
            return;
        }

        setActivating(true);
        setActivationSuccess(false);
        setLocalError("");

        try {
            const permission = await requestPermissionInUserGesture();

            if (permission === "denied") {
                setLocalError(PERMISSION_DENIED_MESSAGE);
                return;
            }

            if (permission !== "granted") {
                setLocalError("הדפדפן אינו תומך בהודעות");
                return;
            }

            const nextToken = await requestNotificationPermission("", {
                skipPermissionPrompt: true
            });

            if (nextToken) {
                setActivationSuccess(true);
                return;
            }

            if (getNotificationPermission() === "denied") {
                setLocalError(PERMISSION_DENIED_MESSAGE);
            }
        } catch (activateError) {
            console.error("Notification opt-in activation failed", activateError);

            if (getNotificationPermission() === "denied") {
                setLocalError(PERMISSION_DENIED_MESSAGE);
            } else {
                setLocalError(
                    activateError?.message || "שגיאה בהפעלת הודעות. נסו שוב."
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
                />
                <span>אני רוצה לקבל עדכונים והודעות מהעמותה</span>
            </label>

            {wantsNotifications && !activationSuccess && (
                <button
                    type="button"
                    className="notification-opt-in__activate"
                    onClick={handleActivate}
                    disabled={activating}
                >
                    {activating ? "מפעיל..." : "הפעלת הודעות"}
                </button>
            )}

            {wantsNotifications && activationSuccess && (
                <p className="notification-opt-in__success" role="status">
                    הודעות ועדכונים הופעלו בהצלחה!
                </p>
            )}

            {wantsNotifications && displayError && (
                <p className="notification-opt-in__error" role="alert">
                    {displayError}
                </p>
            )}
        </div>
    );
}

export default NotificationOptInFields;
