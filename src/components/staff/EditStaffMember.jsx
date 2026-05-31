import { useState } from "react";
import { updateStaffMember } from "../../services/staffService";

function EditStaffMember({ staff }) {
    const [firstName, setFirstName] = useState(staff.user?.firstName || "");
    const [lastName, setLastName] = useState(staff.user?.lastName || "");
    const [phone, setPhone] = useState(staff.user?.phone || "");
    const [gender, setGender] = useState(staff.user?.gender || "");
    const [birthDate, setBirthDate] = useState(staff.user?.birthDate || "");
    const [address, setAddress] = useState(staff.user?.address || "");
    const [role, setRole] = useState(staff.role || "");
    const [isActive, setIsActive] = useState(staff.is_active || false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    if (!staff) {
        return <p>לא נבחר איש צוות לעריכה</p>;
    }

    async function handleUpdateStaff() {
        try {
            await updateStaffMember({
                id: staff.id,
                user_id: staff.user_id,
                firstName,
                lastName,
                phone,
                gender,
                birthDate,
                address,
                role,
                isActive
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
                    placeholder="שם פרטי"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="שם משפחה"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="טלפון"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">בחר מין</option>
                    <option value="male">זכר</option>
                    <option value="female">נקבה</option>
                    <option value="other">אחר</option>
                </select>

                <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="כתובת"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <input
                    type="email"
                    value={staff.email}
                    disabled
                />

                <p style={{ fontSize: "14px", color: "gray" }}>
                    לא ניתן לשנות את האימייל
                </p>

                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="">בחר תפקיד</option>
                    <option value="admin">מנהל</option>
                    <option value="guide">מדריך</option>
                </select>

                <label>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                    פעיל
                </label>

                <button onClick={handleUpdateStaff}>
                    שמירת שינויים
                </button>
            </div>
        </div>
    );
}

export default EditStaffMember;