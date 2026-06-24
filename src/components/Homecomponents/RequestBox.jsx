import { useState } from "react";
import { addRequest } from "../../services/HomeServices/requestsService";

const LANDSCAPE_IMAGE = "/images/community-staff-dashboard/greenhome.png";
const LEAF_DECORATION = "/images/minitree.png";
const CLOUDS_IMAGE = "/images/clouds.png";
const HEART_IMAGE = "/images/heart.png";

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
      <header className="request-section-header">
        <div className="request-section-header__divider">
          <span className="request-section-header__line" aria-hidden="true" />
          <h2 className="request-section-header__title" id="request-section-title">
            פניות ובקשות
          </h2>
          <span className="request-section-header__line" aria-hidden="true" />
        </div>
      </header>

      <section className="request-section" aria-labelledby="request-section-title">
        <img
          className="request-section__leaf"
          src={LEAF_DECORATION}
          alt=""
          aria-hidden="true"
        />

        <div className="request-section__inner">
          <div className="request-section__visual">
            <div className="request-section__scene" aria-hidden="true">
              <img
                className="request-section__clouds"
                src={CLOUDS_IMAGE}
                alt=""
              />
              <img
                className="request-section__landscape"
                src={LANDSCAPE_IMAGE}
                alt=""
              />
            </div>
            <img
              className="request-section__heart-art"
              src={HEART_IMAGE}
              alt=""
              aria-hidden="true"
            />
            <div className="request-section__intro">
              <h3 className="request-section__intro-title">אנחנו כאן בשבילכם</h3>
              <p className="request-section__intro-text">
                יש לכם שאלה, בקשה או זקוקים לעזרה? צוות המתנדבים והעובדים שלנו
                ישמחו לחזור אליכם בהקדם ולסייע בכל מה שתצטרכו.
              </p>
            </div>
          </div>

          <div className="request-box">
            {statusMessage && (
              <div className={`form-message ${messageType}`}>{statusMessage}</div>
            )}

            <label htmlFor="request-phone">מספר טלפון</label>
            <input
              id="request-phone"
              type="text"
              placeholder="הקלד/י מספר טלפון"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label htmlFor="request-message">איך נוכל לעזור?</label>
            <textarea
              id="request-message"
              placeholder="כתבו/י את הפנייה שלך כאן..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />

            <button type="button" onClick={handleSubmit}>
              <span className="request-box__submit-icon" aria-hidden="true">
                ✈
              </span>
              שליחת פנייה
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RequestBox;
