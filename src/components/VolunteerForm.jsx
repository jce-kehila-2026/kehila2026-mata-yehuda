import { useState } from "react";
import { registerVolunteer } from "../services/dayCenterVolunteerService";

function VolunteerForm({ onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit() {
    if (
      firstName === "" ||
      lastName === "" ||
      idNumber === "" ||
      phone === ""
    ) {
      alert("נא למלא את כל השדות");
      return;
    }

    if (idNumber.length !== 9) {
      alert("מספר זהות חייב להיות 9 ספרות");
      return;
    }

    await registerVolunteer({
      firstName,
      lastName,
      idNumber,
      phone,
    });

    alert("הבקשה נשלחה בהצלחה");
    onClose();
  }

  return (
    <div className="form-popup">
      <div className="form-box">
        <button onClick={onClose}>×</button>

        <h2>הרשמה להתנדבות</h2>

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
          placeholder="מספר זהות"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
        />

        <input
          type="text"
          placeholder="מספר טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button onClick={handleSubmit}>שליחה</button>
      </div>
    </div>
  );
}

export default VolunteerForm;