import { useState } from "react";
import { addStaffMember } from "../../services/staffService";

function AddStaffMember({ onSuccess, onCancel }) {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function validateStaff() {
        if (!fullName.trim()) {
            setError("יש להזין שם מלא");
            setSuccess("");
            return false;
        }

        if (!phone.trim()) {
            setError("יש להזין טלפון");
            setSuccess("");
            return false;
        }

        if (!email.trim()) {
            setError("יש להזין אימייל");
            setSuccess("");
            return false;
        }

        if (!password.trim()) {
            setError("יש להזין סיסמה");
            setSuccess("");
            return false;
        }

        setError("");
        return true;
    }

    async function handleAddStaffMember() {
        if (!validateStaff()) {
            return;
        }

        setSubmitting(true);

        try {
            await addStaffMember({
                full_name: fullName,
                phone,
                email,
                password,
                is_active: isActive
            });

            setSuccess("איש הצוות נוסף בהצלחה");
            setError("");
            onSuccess?.();
        } catch (submitError) {
            console.error(submitError);

            if (submitError.code === "auth/email-already-in-use") {
                setError("האימייל כבר קיים במערכת");
            } else if (submitError.code === "auth/weak-password") {
                setError("הסיסמה חייבת להכיל לפחות 6 תווים");
            } else {
                setError("שגיאה בהוספת איש צוות");
            }

            setSuccess("");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="staff-form-section">
            <h2>הוספת איש צוות</h2>

            <div className="staff-form">
                {error ? (
                    <p className="staff-alert staff-alert--error">{error}</p>
                ) : null}
                {success ? (
                    <p className="staff-alert staff-alert--success">{success}</p>
                ) : null}

                <label htmlFor="add-staff-full-name">שם מלא</label>
                <input
                    id="add-staff-full-name"
                    type="text"
                    placeholder="שם מלא"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                />

                <label htmlFor="add-staff-phone">טלפון</label>
                <input
                    id="add-staff-phone"
                    type="text"
                    placeholder="טלפון"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                />

                <label htmlFor="add-staff-email">אימייל</label>
                <input
                    id="add-staff-email"
                    type="email"
                    placeholder="אימייל"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />

                <label htmlFor="add-staff-password">סיסמה זמנית</label>
                <input
                    id="add-staff-password"
                    type="password"
                    placeholder="סיסמה זמנית"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />

                <div className="row checkbox-row">
                    <label htmlFor="add-staff-active">פעיל</label>
                    <input
                        id="add-staff-active"
                        type="checkbox"
                        checked={isActive}
                        onChange={(event) => setIsActive(event.target.checked)}
                    />
                </div>

                <div className="staff-form__actions">
                    {onCancel ? (
                        <button
                            type="button"
                            className="staff-button staff-button--secondary"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            ביטול
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className="staff-button"
                        onClick={handleAddStaffMember}
                        disabled={submitting}
                    >
                        הוספת איש צוות
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddStaffMember;
