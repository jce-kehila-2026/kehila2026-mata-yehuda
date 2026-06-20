import { useState } from "react";
import { useFcmTokenRegistrationContext } from "../notifications/FcmTokenRegistrationProvider";

function PaymentNotificationOptIn() {
    const [wantsNotifications, setWantsNotifications] = useState(false);
    const [activationSuccess, setActivationSuccess] = useState(false);
    const [activating, setActivating] = useState(false);
    const { error, requestNotificationPermission } =
        useFcmTokenRegistrationContext();

    function handleCheckboxChange(event) {
        const checked = event.target.checked;
        setWantsNotifications(checked);

        if (!checked) {
            setActivationSuccess(false);
        }
    }

    async function handleActivate() {
        setActivating(true);
        setActivationSuccess(false);

        try {
            const nextToken = await requestNotificationPermission("");

            if (nextToken) {
                setActivationSuccess(true);
            }
        } finally {
            setActivating(false);
        }
    }

    return (
        <div className="form-field payment-notification-opt-in">
            <label className="payment-notification-opt-in__label">
                <input
                    type="checkbox"
                    className="payment-notification-opt-in__checkbox"
                    checked={wantsNotifications}
                    onChange={handleCheckboxChange}
                />
                <span>אני רוצה לקבל עדכונים והודעות מהעמותה</span>
            </label>

            {wantsNotifications && !activationSuccess && (
                <button
                    type="button"
                    className="payment-notification-opt-in__activate"
                    onClick={handleActivate}
                    disabled={activating}
                >
                    {activating ? "מפעיל..." : "הפעלת הודעות"}
                </button>
            )}

            {wantsNotifications && activationSuccess && (
                <p className="payment-notification-opt-in__success" role="status">
                    הודעות ועדכונים הופעלו בהצלחה!
                </p>
            )}

            {wantsNotifications && error && (
                <p className="payment-notification-opt-in__error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default PaymentNotificationOptIn;
