import { useState } from "react";
import { registerToDayCenter } from "../../services/HomeServices/dayCenterService";

function DayCenterRegisterForm({ onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function handleSubmit() {
    if (
      firstName === "" ||
      lastName === "" ||
      idNumber === "" ||
      phone === ""
    ) {
      setMessage("נא למלא את כל השדות");
      setMessageType("error");
      return;
    }

    if (!/^\d{9}$/.test(idNumber)) {
      setMessage("מספר זהות חייב להיות 9 ספרות");
      setMessageType("error");
      return;
    }

    if (
      !/^(\+972\d{8,9}|972\d{8,9}|0\d{8,9})$/.test(
        phone.replace(/[\s-]/g, "")
      )
    ) {
      setMessage("מספר טלפון לא תקין");
      setMessageType("error");
      return;
    }

    await registerToDayCenter({
      firstName,
      lastName,
      idNumber,
      phone,
    });

    setMessage("תודה שנרשמת. הצוות יחזור אליך בימים הקרובים");
    setMessageType("success");

    setTimeout(() => {
      onClose();
    }, 1600);
  }

  return (
    <div className="form-popup">
      <div className="form-box">
        <button onClick={onClose}>×</button>

        <h2>הרשמה למרכז יום</h2>

        {message && (
          <div className={`form-message ${messageType}`}>
            {message}
          </div>
        )}

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

export default DayCenterRegisterForm;