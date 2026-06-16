import { BIT_TRANSFER_PHONE } from "../../config/Payment/payment";

function DonationSuccessMessage({ paymentMethod }) {
  const method = (paymentMethod || "").toLowerCase();

  if (method === "cash") {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">תודה רבה על תרומתכם!</p>
        <p>
          נציג מהעמותה ייצור איתכם קשר בקרוב להשלמת התרומה במזומן.
        </p>
      </div>
    );
  }

  if (method === "bit") {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">תודה רבה!</p>
        <p>אנא העבירו את התרומה ב-Bit למספר הבא:</p>
        <p className="bit-phone-number">{BIT_TRANSFER_PHONE}</p>
        <p className="payment-success-note">
          לאחר ההעברה התרומה תירשם במערכת.
        </p>
      </div>
    );
  }

  if (method.includes("credit card")) {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">התרומה בוצעה בהצלחה!</p>
        <p>התשלום בכרטיס האשראי אושר. תודה רבה על תמיכתכם בעמותה.</p>
      </div>
    );
  }

  if (method.includes("paypal")) {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">התרומה בוצעה בהצלחה!</p>
        <p>התשלום דרך PayPal אושר. תודה רבה על תמיכתכם בעמותה.</p>
      </div>
    );
  }

  return (
    <div className="payment-success-message">
      <p className="payment-success-lead">התרומה נקלטה בהצלחה!</p>
      <p>תודה רבה על תמיכתכם בעמותה.</p>
    </div>
  );
}

export default DonationSuccessMessage;
