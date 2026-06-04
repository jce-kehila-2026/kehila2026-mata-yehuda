import { useNavigate } from "react-router-dom";
import { getStoredRegistrationPaymentPath } from "../services/paymentLink";

function PaymentCancel() {
  const navigate = useNavigate();

  const retryPayment = () => {
    navigate(getStoredRegistrationPaymentPath());
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <>
      <header className="community-hero">
        <span className="hero-icon" aria-hidden="true">
          ✕
        </span>
        <h1>התשלום לא הושלם</h1>
        <p>ניתן לנסות שוב את התשלום או לחזור למסך הראשי.</p>
      </header>

      <section className="community-section">
        <div className="community-actions">
          <button type="button" className="primary-btn" onClick={retryPayment}>
            נסו שוב את התשלום
          </button>
          <button type="button" className="secondary-btn" onClick={goHome}>
            חזרה למסך הראשי
          </button>
        </div>
      </section>
    </>
  );
}

export default PaymentCancel;
