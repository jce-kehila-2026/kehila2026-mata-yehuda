import { useState } from "react";
import { useFcmTokenRegistrationContext } from "./FcmTokenRegistrationProvider";
import "../../styles/notificationOptInFields.css";

const OPT_IN_LOG = "[fcm opt-in]";
const FCM_LOG = "[fcm]";
const PERMISSION_DENIED_MESSAGE =
    "התראות חסומות בדפדפן. יש לאפשר התראות בהגדרות הדפדפן עבור אתר זה ולנסות שוב.";

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

    console.info(`${FCM_LOG} before Notification.requestPermission()`);
    permission = await Notification.requestPermission();
    console.info(`${FCM_LOG} after Notification.requestPermission():`, permission);

    return permission;
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

        console.info(`${OPT_IN_LOG} button clicked`);

        const permissionBefore = getNotificationPermission();
        console.info(`${OPT_IN_LOG} permission before:`, permissionBefore);

        if (permissionBefore === "denied") {
            setLocalError(PERMISSION_DENIED_MESSAGE);
            return;
        }

        if (typeof requestNotificationPermission !== "function") {
            console.error(
                `${OPT_IN_LOG} requestNotificationPermission is not available from context`
            );
            setLocalError("שגיאה בהפעלת התראות. נסו לרענן את הדף.");
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
                setLocalError("הדפדפן אינו תומך בהתראות");
                return;
            }

            console.info(
                `${OPT_IN_LOG} continuing to existing FCM token flow (skipPermissionPrompt: true)`
            );
            const nextToken = await requestNotificationPermission("", {
                skipPermissionPrompt: true
            });

            console.info(`${OPT_IN_LOG} FCM flow returned`, {
                hasToken: Boolean(nextToken),
                permissionAfter: getNotificationPermission()
            });

            if (nextToken) {
                setActivationSuccess(true);
                return;
            }

            if (getNotificationPermission() === "denied") {
                setLocalError(PERMISSION_DENIED_MESSAGE);
            }
        } catch (activateError) {
            console.error(`${OPT_IN_LOG} activation failed`, activateError);

            if (getNotificationPermission() === "denied") {
                setLocalError(PERMISSION_DENIED_MESSAGE);
            } else {
                setLocalError(
                    activateError?.message || "שגיאה בהפעלת התראות. נסו שוב."
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
