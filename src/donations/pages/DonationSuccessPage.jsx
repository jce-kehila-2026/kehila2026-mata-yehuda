import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DonationSuccessMessage from "../components/DonationSuccessMessage";
import { DONATION_STORAGE_KEYS } from "../config/donations";
import { captureDonationPayPalOrder } from "../services/donationService";

function DonationSuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(
    () => localStorage.getItem(DONATION_STORAGE_KEYS.paymentMethod) || "paypal"
  );
  const captureStarted = useRef(false);

  useEffect(() => {
    if (captureStarted.current) {
      return;
    }
    captureStarted.current = true;

    const captureDonation = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setErrorMessage("לא התקבל אישור תשלום מ-PayPal.");
        setStatus("error");
        return;
      }

      const method =
        localStorage.getItem(DONATION_STORAGE_KEYS.paymentMethod) || "paypal";
      setPaymentMethod(method);

      try {
        const { data } = await captureDonationPayPalOrder({
          orderID: token,
          firstName:
            localStorage.getItem(DONATION_STORAGE_KEYS.firstName) || "",
          phone: localStorage.getItem(DONATION_STORAGE_KEYS.phone) || "",
          amount: localStorage.getItem(DONATION_STORAGE_KEYS.amount) || undefined,
          paymentMethod:
            method === "credit card" ? "PayPal/Credit Card" : "PayPal",
        });

        if (data.success && data.donationId) {
          localStorage.setItem(
            DONATION_STORAGE_KEYS.donationId,
            data.donationId
          );
          setStatus("success");
        } else {
          setErrorMessage(
            data.message || "לא הצלחנו לאשר את התרומה. נסו שוב."
          );
          setStatus("error");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("שגיאה בחיבור לשרת.");
        setStatus("error");
      }
    };

    captureDonation();
  }, []);

  return (
    <>
      <header className="community-hero">
        <span className="hero-icon" aria-hidden="true">
          {status === "success" ? "✓" : status === "error" ? "!" : "⏳"}
        </span>
        <h1>
          {status === "loading"
            ? "מאשרים תרומה"
            : status === "success"
              ? "תודה על תרומתכם"
              : "התרומה לא הושלמה"}
        </h1>
        {status === "loading" && <p>אנא המתינו, התשלום נבדק...</p>}
      </header>

      <section className="community-section donation-flow">
        {status === "success" && (
          <DonationSuccessMessage paymentMethod={paymentMethod} />
        )}

        {status === "error" && (
          <p className="lookup-error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="community-actions">
          {status === "success" && (
            <button type="button" className="primary-btn" onClick={() => navigate("/")}>
              חזרה למסך הראשי
            </button>
          )}
          {status === "error" && (
            <>
              <button
                type="button"
                className="primary-btn"
                onClick={() => navigate("/donations")}
              >
                נסו שוב
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/")}
              >
                חזרה למסך הראשי
              </button>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default DonationSuccessPage;
