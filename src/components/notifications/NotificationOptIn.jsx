import { useState } from "react";
import { useFcmTokenRegistration } from "../../hooks/useFcmTokenRegistration";
import { verifyParticipantForNotifications } from "../../services/notificationTokenService";

function NotificationOptIn() {
    const [idNumber, setIdNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const { permission, token, error, requestNotificationPermission } =
        useFcmTokenRegistration({
            enabled: true
        });

    if (token || permission === "denied") {
        return null;
    }

    async function handleEnableNotifications(event) {
        event.preventDefault();
        setFormError("");
        setSubmitting(true);

        try {
            let participantId = "";

            if (idNumber.trim()) {
                const verification = await verifyParticipantForNotifications({
                    idNumber,
                    phone
                });

                if (!verification.ok) {
                    setFormError(verification.message);
                    return;
                }

                participantId = verification.participantId;
            }

            await requestNotificationPermission(participantId);
        } catch (requestError) {
            console.error(requestError);
            setFormError("שגיאה בהפעלת התראות");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="notification-opt-in" dir="rtl" aria-label="הרשמה להתראות">
            <div className="notification-opt-in__card">
                <h2 className="notification-opt-in__title">התראות מטה יהודה</h2>
                <p className="notification-opt-in__text">
                    קבלו עדכונים ותזכורות ישירות לדפדפן. ניתן לאמת זהות באמצעות תעודת
                    זהות וטלפון.
                </p>

                <form className="notification-opt-in__form staff-form" onSubmit={handleEnableNotifications}>
                    <label htmlFor="notification-id-number">תעודת זהות (אופציונלי)</label>
                    <input
                        id="notification-id-number"
                        type="text"
                        value={idNumber}
                        onChange={(event) => setIdNumber(event.target.value)}
                        placeholder="תעודת זהות"
                    />

                    <label htmlFor="notification-phone">טלפון (אופציונלי)</label>
                    <input
                        id="notification-phone"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="טלפון"
                    />

                    {formError ? (
                        <p className="staff-alert staff-alert--error">{formError}</p>
                    ) : null}
                    {error ? (
                        <p className="staff-alert staff-alert--error">{error}</p>
                    ) : null}

                    <button
                        type="submit"
                        className="staff-button"
                        disabled={submitting}
                    >
                        {submitting ? "מפעיל..." : "אישור קבלת התראות"}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default NotificationOptIn;
