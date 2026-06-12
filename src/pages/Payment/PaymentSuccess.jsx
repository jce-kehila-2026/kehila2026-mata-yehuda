import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentSuccessMessage from "../../components/Payment/PaymentSuccessMessage";
import PaymentFailureScreen from "../../components/Payment/PaymentFailureScreen";
import RegistrationStepper, {
  REGISTRATION_STEPS,
} from "../../components/Payment/RegistrationStepper";
import { API_BASE } from "../../services/Payment/api";
import { getStoredRegistrationPaymentPath } from "../../services/Payment/paymentLink";
import { PAYMENT_ERROR_REASONS } from "../../services/Payment/paymentErrorMessages";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [errorInfo, setErrorInfo] = useState({ message: "", code: "", reason: "" });
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
        setErrorInfo({
          message: "לא התקבל אישור תשלום מ-PayPal. ניתן לנסות שוב.",
          reason: PAYMENT_ERROR_REASONS.NO_PAYPAL_TOKEN,
        });
        setStatus("error");
        return;
      }

      const storedActivityId = localStorage.getItem("activityId");
      if (!storedActivityId) {
        setErrorInfo({
          message:
            "לא נמצאו פרטי הפעילות. חזרו לדף ההרשמה ונסו שוב את התשלום.",
          reason: PAYMENT_ERROR_REASONS.MISSING_ACTIVITY,
        });
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
            activityId: storedActivityId,
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
          setErrorInfo({
            message,
            code: data.code || "",
            reason: PAYMENT_ERROR_REASONS.CAPTURE_FAILED,
          });
          setStatus("error");
        }
      } catch (error) {
        console.error(error);
        setErrorInfo({
          message: error.message || "שגיאה בחיבור לשרת",
          reason: PAYMENT_ERROR_REASONS.CONNECTION_ERROR,
        });
        setStatus("error");
      }
    };

    capturePayment();
  }, []);

  if (status === "loading") {
    return (
      <>
        <header className="community-hero">
          <span className="hero-icon" aria-hidden="true">⏳</span>
          <h1>מאשרים תשלום</h1>
          <p>אנא המתינו, התשלום נבדק כעת...</p>
        </header>
      </>
    );
  }

  if (status === "error") {
    return (
      <PaymentFailureScreen
        message={errorInfo.message}
        code={errorInfo.code}
        reason={errorInfo.reason}
        onRetry={retryPayment}
        onGoHome={goHome}
      />
    );
  }

  return (
    <>
      <header className="community-hero">
        <span className="hero-icon" aria-hidden="true">✓</span>
        <h1>ההרשמה הושלמה</h1>
      </header>

      <section className="community-section registration-flow">
        <RegistrationStepper currentStep={REGISTRATION_STEPS.length} />
        <PaymentSuccessMessage paymentMethod={paymentMethod} />
        <div className="community-actions">
          <button type="button" className="primary-btn" onClick={goHome}>
            חזרה למסך הראשי
          </button>
        </div>
      </section>
    </>
  );
}

export default PaymentSuccess;
