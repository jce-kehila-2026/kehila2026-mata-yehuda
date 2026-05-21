import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";



function AddStaffMember() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function validateStaff() {
        if (!firstName.trim()) {
            setError("יש להזין שם פרטי");
            setSuccess("");
            return false;
        }

        if (!lastName.trim()) {
            setError("יש להזין שם משפחה");
            setSuccess("");
            return false;
        }

        if (!phone.trim()) {
            setError("יש להזין טלפון");
            setSuccess("");
            return false;
        }

        if (!gender) {
            setError("יש לבחור מין");
            setSuccess("");
            return false;
        }

        if (!birthDate) {
            setError("יש להזין תאריך לידה");
            setSuccess("");
            return false;
        }

        if (!address.trim()) {
            setError("יש להזין כתובת");
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

        if (!role) {
            setError("יש לבחור תפקיד");
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, "user", uid), {
                firstName,
                lastName,
                phone,
                gender,
                birthDate,
                address,
                created_at: new Date()
            });

            await setDoc(doc(db, "Staff", uid), {
                user_id: uid,
                role,
                email,
                is_active: isActive
            });

            setSuccess("איש הצוות נוסף בהצלחה");
            setError("");

        } catch (error) {
            setError("שגיאה בהוספת איש צוות");
            setSuccess("");
            console.log(error);
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
                <div className="row">
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option value="">בחר מין</option>
                        <option value="male">זכר</option>
                        <option value="female">נקבה</option>
                        <option value="other">אחר</option>

                    </select>
                </div>
                <input
                    type="date"
                    placeholder="תאריך לידה"
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
                <div className="row">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="">בחר תפקיד</option>
                        <option value="admin">מנהל</option>
                        <option value="guide">מדריך</option>

                    </select>
                </div>
                <div className="row">
                    <label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        פעיל
                    </label>
                </div>

                <button onClick={handleAddStaffMember}>
                    הוספת איש צוות
                </button>

            </div>
        </div>
    )
}

export default AddStaffMember;