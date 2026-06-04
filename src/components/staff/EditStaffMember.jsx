import { useState } from "react";
import { updateStaffMember } from "../../services/staffService";

function EditStaffMember({ staff }) {
    const [fullName, setFullName] = useState(staff?.full_name || "");
    const [phone, setPhone] = useState(staff?.phone || "");
    const [password, setPassword] = useState("");
    const [isActive, setIsActive] = useState(staff?.is_active ?? false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    if (!staff) {
        return <p>לא נבחר איש צוות לעריכה</p>;
    }

    async function handleUpdateStaff() {
        try {
            await updateStaffMember({
                id: staff.id,
                full_name: fullName,
                phone,
                is_active: isActive,
                password
            });

            setSuccess("איש הצוות עודכן בהצלחה");
            setError("");
        } catch (err) {
            console.log(err);
            setError("שגיאה בעדכון איש הצוות");
            setSuccess("");
        }
    }

    return (
        <div>
            <h2>עריכת איש צוות</h2>

            <div className="staff-form">
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <input
                    type="text"
                    placeholder="שם מלא"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="טלפון"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <input
                    type="email"
                    value={staff.email}
                    disabled
                />

                <p style={{ fontSize: "14px", color: "gray" }}>
                    לא ניתן לשנות את האימייל
                </p>

                <input
                    type="password"
                    placeholder="סיסמה חדשה (אופציונלי)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="row checkbox-row">
                    <label>פעיל</label>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                </div>

                <button
                    type="button"
                    className="staff-button"
                    onClick={handleUpdateStaff}
                >
                    שמירת שינויים
                </button>
            </div>
        </div>
    );
}

export default EditStaffMember;
