import { useState } from "react";
import { addRequest } from "../../services/HomeServices/requestsService";

function RequestBox() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function handleSubmit() {
    if (phone === "" || message === "") {
    setStatusMessage("נא למלא מספר טלפון ובקשה");
    setMessageType("error");
    return;
    }
    if (
      !/^(\+972\d{8,9}|972\d{8,9}|0\d{8,9})$/.test(
        phone.replace(/[\s-]/g, "")
      )
    ) {
      setStatusMessage("מספר טלפון לא תקין");
      setMessageType("error");
      return;
    }

    await addRequest(phone, message);

    setStatusMessage("הפנייה נשלחה בהצלחה");
    setMessageType("success");
  

    setPhone("");
    setMessage("");

    setTimeout(() => {
    setStatusMessage("");
  }, 3000);
  }

  return (
    <div className="contact-request-grid">

      <div className="request-box">
        <h2>פניות ובקשות</h2>
        {statusMessage && (
          <div className={`form-message ${messageType}`}>
            {statusMessage}
          </div>
        )}
        
        <label>מספר טלפון</label>

        <input
          type="text"
          placeholder="הקלד/י מספר טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>איך נוכל לעזור?</label>

        <textarea
          placeholder="כתבו/י את הפנייה שלך כאן..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />

        <button onClick={handleSubmit}>
          שליחת פנייה
        </button>
      </div>

    </div>
  );
}

export default RequestBox;