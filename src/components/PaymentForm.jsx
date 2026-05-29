import { useEffect, useState } from "react";
import CancelRegistrationButton from "./CancelRegistrationButton";

function PaymentForm({ onRegistrationCancelled }) {
  const [completedPaymentId, setCompletedPaymentId] = useState(() =>
    localStorage.getItem("registrationPaymentId")
  );
  const [showLookupScreen, setShowLookupScreen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupStatus, setLookupStatus] = useState(null);
  const [lookupPaymentId, setLookupPaymentId] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem("registrationPaymentId");
    if (savedId) {
      setCompletedPaymentId(savedId);
    }
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    paymentMethod: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.paymentMethod) {
      alert("בבקשה תמלא את כל הפרטים");
      return;
    }

    if (formData.paymentMethod === "cash") {
      try {
        const response = await fetch("http://localhost:5001/save-cash-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            paymentMethod: "cash",
            amount: 50,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("המקום שלך שמור. התשלום במזומן יתבצע ביום האירוע או לפני כן.");
          if (data.paymentId) {
            localStorage.setItem("registrationPaymentId", data.paymentId);
            setCompletedPaymentId(data.paymentId);
          }
        } else {
          alert("הייתה שגיאה בשמירת ההרשמה");
        }

        if (!data.success) {
          setFormData({
            firstName: "",
            lastName: "",
            phone: "",
            paymentMethod: "",
          });
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
            localStorage.setItem("firstName", formData.firstName);
            localStorage.setItem("lastName", formData.lastName);
            localStorage.setItem("phone", formData.phone);
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
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                paymentMethod: "bit",
                amount: 50,
              }),
            }
          );

          const data = await response.json();

          if (data.success) {

            alert(
              "ההרשמה נשמרה. אנא בצעו תשלום ב-Bit למספר 050-0000000"
            );

            if (data.paymentId) {
              localStorage.setItem("registrationPaymentId", data.paymentId);
              setCompletedPaymentId(data.paymentId);
            }

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
    const phone = lookupPhone.trim();

    if (!phone) {
      alert("אנא הזינו מספר טלפון");
      return;
    }

    setLookupLoading(true);
    setLookupStatus(null);
    setLookupPaymentId(null);

    try {
      const response = await fetch(
        "http://localhost:5001/find-active-registration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }
      );

      const data = await response.json();

      if (data.success && data.paymentId) {
        setLookupPaymentId(data.paymentId);
        localStorage.setItem("registrationPaymentId", data.paymentId);
        setLookupStatus("found");
      } else {
        setLookupStatus("not_found");
      }
    } catch (error) {
      console.error(error);
      alert("שגיאה בחיבור לשרת");
    } finally {
      setLookupLoading(false);
    }
  };

  if (completedPaymentId && !showLookupScreen) {
    return (
      <div className="page-content">
        <h2>ההרשמה נשמרה בהצלחה</h2>
        <p>לחץ למטה אם ברצונך לבטל את ההרשמה.</p>
        <CancelRegistrationButton
          paymentId={completedPaymentId}
          onCancelled={() => {
            setCompletedPaymentId(null);
            setFormData({
              firstName: "",
              lastName: "",
              phone: "",
              paymentMethod: "",
            });
            onRegistrationCancelled?.();
          }}
        />
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
                setCompletedPaymentId(null);
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
              placeholder="מספר טלפון"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              disabled={lookupLoading}
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
        placeholder="שם פרטי"
        value={formData.firstName}
        onChange={handleChange}
      />

      <input
        type="text"
        name="lastName"
        placeholder="שם משפחה"
        value={formData.lastName}
        onChange={handleChange}
      />

      <input
        type="tel"
        name="phone"
        placeholder="מספר טלפון"
        value={formData.phone}
        onChange={handleChange}
      />

      <h3>בחר שיטת התשלום:</h3>

            <label>
        <input
          type="radio"
          name="paymentMethod"
          value="credit card"
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