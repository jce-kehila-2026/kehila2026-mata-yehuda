import { useState } from "react";
import { registerToDayCenter } from "../../services/HomeServices/dayCenterService";
import NotificationOptInFields from "../notifications/NotificationOptInFields";
import {
  INVALID_ID_NUMBER_MESSAGE,
  INVALID_PHONE_MESSAGE,
  isValidIsraeliIdNumber,
  isValidIsraeliPhoneNumber,
} from "../../services/dayCenterVolunteerRequestService";
import { nameContainsNumber } from "../../utils/nameValidation";

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

    if (nameContainsNumber(firstName) || nameContainsNumber(lastName)) {
      setMessage("השם אינו יכול להכיל מספרים");
      setMessageType("error");
      return;
    }

    if (!isValidIsraeliIdNumber(idNumber)) {
      setMessage(INVALID_ID_NUMBER_MESSAGE);
      setMessageType("error");
      return;
    }

    if (!isValidIsraeliPhoneNumber(phone)) {
      setMessage(INVALID_PHONE_MESSAGE);
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
          inputMode="numeric"
          placeholder="מספר זהות"
          value={idNumber}
          onChange={(e) =>
            setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 9))
          }
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder="מספר טלפון"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
        />

        <NotificationOptInFields />

        <button type="button" onClick={handleSubmit}>שליחה</button>
      </div>
    </div>
  );
}

export default DayCenterRegisterForm;