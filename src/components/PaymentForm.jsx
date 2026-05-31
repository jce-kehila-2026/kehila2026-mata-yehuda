import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CancelRegistrationButton from "./CancelRegistrationButton";
import {
  validateIsraeliPhone,
  validateRegistrationForm,
} from "../services/validation";
import { BIT_TRANSFER_PHONE } from "../config/payment";
import { apiPost } from "../services/api";

const EMPTY_FORM_DATA = {
  firstName: "",
  idNumber: "",
  phone: "",
  paymentMethod: "",
};

function PaymentSuccessMessage({ paymentMethod }) {
  if (paymentMethod === "cash") {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">ההרשמה הצליחה!</p>
        <p>
          אחד מהעמותה יחזור אליכם בטלפון בקרוב כדי להשלים את פרטי התשלום במזומן.
        </p>
      </div>
    );
  }

  if (paymentMethod === "bit") {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">ההרשמה הצליחה!</p>
        <p>אנא העבירו את התשלום ב-Bit למספר הבא:</p>
        <p className="bit-phone-number">{BIT_TRANSFER_PHONE}</p>
        <p className="payment-success-note">לאחר ההעברה, המקום שלכם שמור.</p>
      </div>
    );
  }

  return (
    <p>לחצו למטה אם ברצונכם לבטל את ההרשמה.</p>
  );
}

function PaymentForm({ onRegistrationCancelled }) {
  const navigate = useNavigate();
  const [completedPaymentId, setCompletedPaymentId] = useState(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(true);
  const [completedPaymentMethod, setCompletedPaymentMethod] = useState("");
  const [showLookupScreen, setShowLookupScreen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupStatus, setLookupStatus] = useState(null);
  const [lookupPaymentId, setLookupPaymentId] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const saveCompletedRegistration = (paymentId, paymentMethod) => {
    localStorage.setItem("registrationPaymentId", paymentId);
    localStorage.setItem("registrationPaymentMethod", paymentMethod);
    setCompletedPaymentId(paymentId);
    setCompletedPaymentMethod(paymentMethod);
    setShowPaymentConfirmation(true);
  };

  const clearCompletedRegistration = () => {
    localStorage.removeItem("registrationPaymentId");
    localStorage.removeItem("registrationPaymentMethod");
    setCompletedPaymentId(null);
    setCompletedPaymentMethod("");
    setShowPaymentConfirmation(true);
  };

  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;

    if (name === "phone") {
      filtered = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "idNumber") {
      filtered = value.replace(/\D/g, "").slice(0, 9);
    } else if (name === "firstName") {
      filtered = value.replace(/[^\u0590-\u05FFa-zA-Z\s'-]/g, "");
    }

    setFormData({
      ...formData,
      [name]: filtered,
    });
  };

  const handleLookupPhoneChange = (e) => {
    setLookupPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const validation = validateRegistrationForm(formData);

    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const { firstName, idNumber, phone } = validation;

    if (formData.paymentMethod === "cash") {
      try {
        const response = await fetch("http://localhost:5001/save-cash-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            idNumber,
            phone,
            paymentMethod: "cash",
            amount: 50,
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.paymentId) {
            saveCompletedRegistration(data.paymentId, "cash");
          }
        } else {
          alert("הייתה שגיאה בשמירת ההרשמה");
        }

        if (!data.success) {
          setFormData(EMPTY_FORM_DATA);
        }
      } catch (error) {
        console.error(error);
        alert("שגיאה בחיבור לשרת");
      }
    }
    else if (formData.paymentMethod === "paypal" || formData.paymentMethod === "credit card") {
        try {
            const response = await fetch("http://localhost:5001/create-paypal-order", {
            method: "POST",
            });

            console.log("response status:", response.status);

            const data = await response.json();
            console.log("paypal data:", data);

            if (!data.links) {
            alert("PayPal did not return links. Check server terminal.");
            return;
            }

            const approveLink = data.links.find((link) => link.rel === "approve");

            if (!approveLink) {
            alert("No approve link found");
            return;
            }

            window.location.href = approveLink.href;
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("idNumber", idNumber);
            localStorage.setItem("phone", phone);
        } catch (error) {
            console.error("FULL ERROR:", error);
            alert("Error: " + String(error));
        }
    }
    else if (formData.paymentMethod === "bit") {

        try {

          const response = await fetch(
            "http://localhost:5001/save-bit-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                firstName,
                idNumber,
                phone,
                paymentMethod: "bit",
                amount: 50,
              }),
            }
          );

          const data = await response.json();

          if (data.success && data.paymentId) {
            saveCompletedRegistration(data.paymentId, "bit");
          }

        } catch (error) {

          console.error(error);

        }
      }
     else {
      alert(`Redirecting to ${formData.paymentMethod} payment...`);
    }

    console.log(formData);
  };

  const openLookupScreen = () => {
    setLookupPhone("");
    setLookupStatus(null);
    setLookupPaymentId(null);
    setShowLookupScreen(true);
  };

  const closeLookupScreen = () => {
    setShowLookupScreen(false);
    setLookupPhone("");
    setLookupStatus(null);
    setLookupPaymentId(null);
    setLookupLoading(false);
  };

  const resetLookupSearch = () => {
    setLookupStatus(null);
    setLookupPaymentId(null);
    setLookupPhone("");
  };

  const searchRegistrationByPhone = async () => {
    const phoneValidation = validateIsraeliPhone(lookupPhone);

    if (!phoneValidation.valid) {
      alert(phoneValidation.message);
      return;
    }

    const phone = phoneValidation.phone;

    setLookupLoading(true);
    setLookupStatus(null);
    setLookupPaymentId(null);

    try {
      const { data } = await apiPost("/find-active-registration", { phone });

      if (data.success && data.paymentId) {
        setLookupPaymentId(data.paymentId);
        localStorage.setItem("registrationPaymentId", data.paymentId);
        setLookupStatus("found");
      } else {
        setLookupStatus("not_found");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "שגיאה בחיבור לשרת");
    } finally {
      setLookupLoading(false);
    }
  };

  const goToHomeScreen = () => {
    setShowPaymentConfirmation(false);
    setCompletedPaymentId(null);
    setCompletedPaymentMethod("");
    setFormData(EMPTY_FORM_DATA);
    setShowLookupScreen(false);
    setLookupPhone("");
    setLookupStatus(null);
    setLookupPaymentId(null);
    localStorage.removeItem("firstName");
    localStorage.removeItem("idNumber");
    localStorage.removeItem("phone");
    navigate("/");
  };

  if (completedPaymentId && showPaymentConfirmation && !showLookupScreen) {
    return (
      <div className="page-content post-payment-screen">
        <h2>ההרשמה נשמרה בהצלחה</h2>
        <PaymentSuccessMessage paymentMethod={completedPaymentMethod} />
        <p className="cancel-hint">ניתן לבטל את ההרשמה בכל עת לפני האירוע:</p>
        <div className="post-payment-actions">
          <CancelRegistrationButton
            paymentId={completedPaymentId}
            onCancelled={() => {
              clearCompletedRegistration();
              setFormData(EMPTY_FORM_DATA);
              onRegistrationCancelled?.();
            }}
          />
          <button type="button" className="secondary-btn" onClick={goToHomeScreen}>
            חזרה למסך הראשי
          </button>
        </div>
      </div>
    );
  }

  if (showLookupScreen) {
    return (
      <div className="page-content lookup-screen">
        <h2>ביטול הרשמה</h2>

        {lookupStatus === "found" && lookupPaymentId && (
          <>
            <p className="lookup-success">נמצאה הרשמה פעילה למספר זה.</p>
            <p>לחצו על הכפתור למטה כדי לבטל את ההרשמה.</p>
            <CancelRegistrationButton
              paymentId={lookupPaymentId}
              onCancelled={() => {
                clearCompletedRegistration();
                closeLookupScreen();
                onRegistrationCancelled?.();
              }}
            />
            <br />
            <button type="button" className="secondary-btn" onClick={closeLookupScreen}>
              חזרה לטופס תשלום
            </button>
          </>
        )}

        {lookupStatus === "not_found" && (
          <>
            <p className="lookup-error">אין הרשמה עבור המספר הזה</p>
            <button type="button" className="secondary-btn" onClick={resetLookupSearch}>
              חיפוש עם מספר אחר
            </button>
            <br />
            <button type="button" className="secondary-btn" onClick={closeLookupScreen}>
              חזרה לטופס תשלום
            </button>
          </>
        )}

        {lookupStatus !== "found" && lookupStatus !== "not_found" && (
          <>
            <p>הזינו את מספר הטלפון שאיתו נרשמתם</p>
            <input
              type="tel"
              className="lookup-phone-input"
              placeholder="05XXXXXXXX"
              value={lookupPhone}
              onChange={handleLookupPhoneChange}
              disabled={lookupLoading}
              maxLength={10}
              inputMode="numeric"
            />
            <button
              type="button"
              className="primary-btn"
              onClick={searchRegistrationByPhone}
              disabled={lookupLoading}
            >
              {lookupLoading ? "מחפש..." : "חפש הרשמה"}
            </button>
            <br />
            <button
              type="button"
              className="secondary-btn"
              onClick={closeLookupScreen}
              disabled={lookupLoading}
            >
              חזרה לטופס תשלום
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <form className="payment-form" onSubmit={handlePayment}>
        
      <input
        type="text"
        name="firstName"
        placeholder="שם פרטי (אותיות בלבד)"
        value={formData.firstName}
        onChange={handleChange}
      />

      <input
        type="tel"
        name="idNumber"
        placeholder="מספר תעודת זהות (9 ספרות)"
        value={formData.idNumber}
        onChange={handleChange}
        maxLength={9}
        inputMode="numeric"
      />

      <input
        type="tel"
        name="phone"
        placeholder="05XXXXXXXX"
        value={formData.phone}
        onChange={handleChange}
        maxLength={10}
        inputMode="numeric"
      />

      <h3>בחר שיטת התשלום:</h3>

            <label>
        <input
          type="radio"
          name="paymentMethod"
          value="credit card"
          checked={formData.paymentMethod === "credit card"}
          onChange={handleChange}
        />
        כרטיס אשראי
      </label>

      <br/>

      <label>
        <input
          type="radio"
          name="paymentMethod"
          value="paypal"
          checked={formData.paymentMethod === "paypal"}
          onChange={handleChange}
        />
        PayPal
      </label>

      <br/>

      <label>
        <input
          type="radio"
          name="paymentMethod"
          value="bit"
          checked={formData.paymentMethod === "bit"}
          onChange={handleChange}
        />
        Bit
      </label>

      <br/>

      <label>
        <input
          type="radio"
          name="paymentMethod"
          value="cash"
          checked={formData.paymentMethod === "cash"}
          onChange={handleChange}
        />
        מזומן
      </label>

      <br />

      <button type="submit">שלם</button>

      <br />
      <br />
      <p>כבר נרשמת ורוצה לבטל?</p>
      <button type="button" className="cancel-registration-btn" onClick={openLookupScreen}>
        מצא את ההרשמה שלי לביטול
      </button>
    </form>
  );
}

export default PaymentForm;