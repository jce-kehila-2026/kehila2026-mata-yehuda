import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CancelRegistrationButton from "../components/CancelRegistrationButton";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState(() =>
    localStorage.getItem("registrationPaymentId")
  );
  const [cancelled, setCancelled] = useState(false);
  const captureStarted = useRef(false);

  useEffect(() => {
    if (captureStarted.current) {
      return;
    }
    captureStarted.current = true;

    const capturePayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5001/capture-paypal-order",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              orderID: token,

              firstName: localStorage.getItem("firstName"),
              lastName: localStorage.getItem("lastName"),
              phone: localStorage.getItem("phone"),

              paymentMethod: "PayPal/Credit Card",
              amount: 50,
            }),
          }
        );

        const data = await response.json();

        if (data.success && data.paymentId) {
          setPaymentId(data.paymentId);
          localStorage.setItem("registrationPaymentId", data.paymentId);
        }
      } catch (error) {
        console.error(error);
      }
    };

    capturePayment();
  }, []);

  if (cancelled) {
    return (
      <div className="page-content">
        <h1>ההרשמה בוטלה</h1>
        <br />
        <button onClick={() => navigate("/")}>חזרה למסך הראשי</button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1>העסקה בוצעה בהצלחה!!</h1>
      <p>ניתן לבטל את ההרשמה בכל עת לפני האירוע.</p>
      <br />
      {paymentId ? (
        <CancelRegistrationButton
          paymentId={paymentId}
          onCancelled={() => setCancelled(true)}
        />
      ) : (
        <p>טוען אפשרות ביטול...</p>
      )}
      <br />
      <br />
      <button onClick={() => navigate("/")}>חזרה למסך הראשי</button>
    </div>
  );
}

export default PaymentSuccess;
