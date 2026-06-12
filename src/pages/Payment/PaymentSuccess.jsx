import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentSuccessMessage from "../../components/Payment/PaymentSuccessMessage";
import RegistrationStepper, {
  REGISTRATION_STEPS,
} from "../../components/Payment/RegistrationStepper";
import { API_BASE } from "../../services/Payment/api";
import { getStoredRegistrationPaymentPath } from "../../services/Payment/paymentLink";
import { notifyRegistrationBlock } from "../../services/Payment/registrationErrors";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(
    () => localStorage.getItem("registrationPaymentMethod") || "paypal"
  );
  const captureStarted = useRef(false);

  const retryPayment = () => {
    navigate(getStoredRegistrationPaymentPath());
  };

  const goHome = () => {
    navigate("/");
  };

  useEffect(() => {
    if (captureStarted.current) {
      return;
    }
    captureStarted.current = true;

    const capturePayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setErrorMessage("לא התקבל אישור תשלום מ-PayPal. ניתן לנסות שוב.");
        setStatus("error");
        return;
      }

      const method =
        localStorage.getItem("registrationPaymentMethod") || "paypal";
      setPaymentMethod(method);

      try {
        const response = await fetch(`${API_BASE}/capture-paypal-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            orderID: token,

            firstName: localStorage.getItem("firstName"),
            idNumber: localStorage.getItem("idNumber"),
            phone: localStorage.getItem("phone"),

            paymentMethod:
              method === "credit card" ? "PayPal/Credit Card" : "PayPal",
            activityId: localStorage.getItem("activityId") || undefined,
            programId: localStorage.getItem("programId") || undefined,
          }),
        });

        const data = await response.json();

        if (data.success && data.paymentId) {
          localStorage.setItem("registrationPaymentId", data.paymentId);
          localStorage.setItem("registrationPaymentMethod", method);
          setStatus("success");
        } else {
          const message =
            data.message ||
            "לא הצלחנו לאשר את התשלום. ניתן לנסות שוב או לחזור למסך הראשי.";
          notifyRegistrationBlock(message);
          setErrorMessage(message);
          setStatus("error");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "שגיאה בחיבור לשרת. ניתן לנסות שוב או לחזור למסך הראשי."
        );
        setStatus("error");
      }
    };

    capturePayment();
  }, []);

  return (
    <>
      <header className="community-hero">
        <span className="hero-icon" aria-hidden="true">
          {status === "success" ? "✓" : status === "error" ? "!" : "⏳"}
        </span>
        <h1>
          {status === "loading"
            ? "מאשרים תשלום"
            : status === "success"
              ? "ההרשמה הושלמה"
              : "התשלום לא הושלם"}
        </h1>
        {status === "loading" && (
          <p>אנא המתינו, התשלום נבדק כעת...</p>
        )}
        {status === "error" && (
          <p>ניתן לנסות שוב את התשלום או לחזור למסך הראשי.</p>
        )}
      </header>

      <section className="community-section registration-flow">
        {status === "success" && (
          <RegistrationStepper currentStep={REGISTRATION_STEPS.length} />
        )}

        {status === "success" && (
          <PaymentSuccessMessage paymentMethod={paymentMethod} />
        )}

        {status === "error" && (
          <p className="lookup-error" role="alert">
            {errorMessage}
          </p>
        )}

        {status === "success" && (
          <div className="community-actions">
            <button type="button" className="primary-btn" onClick={goHome}>
              חזרה למסך הראשי
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="community-actions">
            <button type="button" className="primary-btn" onClick={retryPayment}>
              נסו שוב את התשלום
            </button>
            <button type="button" className="secondary-btn" onClick={goHome}>
              חזרה למסך הראשי
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default PaymentSuccess;
