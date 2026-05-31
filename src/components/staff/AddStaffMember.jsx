import { useState } from "react";
import { addStaffMember } from "../../services/staffService";

function AddStaffMember() {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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

            setFullName("");
            setPhone("");
            setEmail("");
            setPassword("");
            setIsActive(false);

        } catch (error) {
            console.log(error.code);

            if (error.code === "auth/email-already-in-use") {
                setError("האימייל כבר קיים במערכת");
            } else if (error.code === "auth/weak-password") {
                setError("הסיסמה חייבת להכיל לפחות 6 תווים");
            } else {
                setError("שגיאה בהוספת איש צוות");
            }

            setSuccess("");
        }
    }

    return (
        <div>

            <h1>הוספת איש צוות</h1>
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
                    placeholder="אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="סיסמה זמנית"
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

                <button onClick={handleAddStaffMember}>
                    הוספת איש צוות
                </button>

            </div>
        </div>
    )
}

export default AddStaffMember;