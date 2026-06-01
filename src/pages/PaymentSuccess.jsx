import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentSuccessMessage from "../components/PaymentSuccessMessage";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [paymentMethod, setPaymentMethod] = useState(
    () => localStorage.getItem("registrationPaymentMethod") || "paypal"
  );
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
        setStatus("error");
        return;
      }

      const method =
        localStorage.getItem("registrationPaymentMethod") || "paypal";
      setPaymentMethod(method);

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
              idNumber: localStorage.getItem("idNumber"),
              phone: localStorage.getItem("phone"),

              paymentMethod:
                method === "credit card" ? "PayPal/Credit Card" : "PayPal",
              amount: 50,
            }),
          }
        );

        const data = await response.json();

        if (data.success && data.paymentId) {
          localStorage.setItem("registrationPaymentId", data.paymentId);
          localStorage.setItem("registrationPaymentMethod", method);
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    capturePayment();
  }, []);

  return (
    <div className="page-content post-payment-screen">
      {status === "loading" && (
        <p className="payment-loading-text">מאשרים את התשלום...</p>
      )}

      {status === "success" && (
        <PaymentSuccessMessage paymentMethod={paymentMethod} />
      )}

      {status === "error" && (
        <div className="payment-success-message">
          <p className="lookup-error">
            לא הצלחנו לאשר את התשלום. אנא פנו לעמותה או נסו שוב.
          </p>
        </div>
      )}

      {status !== "loading" && (
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/")}
        >
          חזרה למסך הראשי
        </button>
      )}
    </div>
  );
}

export default PaymentSuccess;
