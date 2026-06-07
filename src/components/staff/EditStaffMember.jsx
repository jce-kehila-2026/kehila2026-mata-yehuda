import { useState } from "react";
import { updateStaffMember } from "../../services/staffService";
import {
    getStaffRoleKey,
    STAFF_ROLE_FILTER_OPTIONS
} from "../../utils/staffStatusLabels";

function EditStaffMember({ staff, onCompleted, onCancel }) {
    const [fullName, setFullName] = useState(staff?.full_name || "");
    const [phone, setPhone] = useState(staff?.phone || "");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(getStaffRoleKey(staff));
    const [isActive, setIsActive] = useState(staff?.is_active ?? false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!staff) {
        return <p>לא נבחר איש צוות לעריכה</p>;
    }

    async function handleUpdateStaff() {
        setSubmitting(true);

        try {
            await updateStaffMember({
                id: staff.id,
                full_name: fullName,
                phone,
                role,
                is_active: isActive,
                password
            });

            setSuccess("איש הצוות עודכן בהצלחה");
            setError("");
            onCompleted?.();
        } catch (err) {
            console.error(err);
            setError("שגיאה בעדכון איש הצוות");
            setSuccess("");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="staff-form-section">
            <h2>עריכת איש צוות</h2>

            <div className="staff-form">
                {error ? (
                    <p className="staff-alert staff-alert--error">{error}</p>
                ) : null}
                {success ? (
                    <p className="staff-alert staff-alert--success">{success}</p>
                ) : null}

                <label htmlFor="edit-staff-full-name">שם מלא</label>
                <input
                    id="edit-staff-full-name"
                    type="text"
                    placeholder="שם מלא"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                />

                <label htmlFor="edit-staff-phone">טלפון</label>
                <input
                    id="edit-staff-phone"
                    type="text"
                    placeholder="טלפון"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                />

                <label htmlFor="edit-staff-email">אימייל</label>
                <input id="edit-staff-email" type="email" value={staff.email} disabled />

                <p className="staff-form__hint">לא ניתן לשנות את האימייל</p>

                <label htmlFor="edit-staff-role">תפקיד</label>
                <select
                    id="edit-staff-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                >
                    {STAFF_ROLE_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <label htmlFor="edit-staff-password">סיסמה חדשה (אופציונלי)</label>
                <input
                    id="edit-staff-password"
                    type="password"
                    placeholder="סיסמה חדשה (אופציונלי)"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />

                <div className="row checkbox-row">
                    <label htmlFor="edit-staff-active">פעיל</label>
                    <input
                        id="edit-staff-active"
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
                        onClick={handleUpdateStaff}
                        disabled={submitting}
                    >
                        שמירת שינויים
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditStaffMember;
