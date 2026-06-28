import { BIT_TRANSFER_PHONE } from "../../config/Payment/payment";

function PaymentSuccessMessage({ paymentMethod }) {
  const method = (paymentMethod || "").toLowerCase();

  if (method === "free") {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">ההרשמה הושלמה בהצלחה!</p>
        <p>נרשמתם לפעילות החינמית. נתראה בפעילות!</p>
      </div>
    );
  }

  if (method === "cash") {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">התשלום וההרשמה הצליחו!</p>
        <p>
          אחד מהעמותה יחזור אליכם בטלפון בקרוב כדי להשלים את פרטי התשלום במזומן.
        </p>
      </div>
    );
  }

  if (method === "bit") {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">ההרשמה הצליחה!</p>
        <p>אנא העבירו את התשלום ב-Bit למספר הבא:</p>
        <p className="bit-phone-number">{BIT_TRANSFER_PHONE}</p>
        <p className="payment-success-note">מצורף מספר טלפון שבו ניתן להעביר את התשלום, המקום שלכם שמורר.</p>
      </div>
    );
  }

  if (method.includes("credit card")) {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">התשלום בוצע בהצלחה!</p>
        <p>התשלום בכרטיס האשראי אושר וההרשמה שלכם נשמרה.</p>
      </div>
    );
  }

  if (method.includes("paypal")) {
    return (
      <div className="payment-success-message">
        <p className="payment-success-lead">התשלום בוצע בהצלחה!</p>
        <p>התשלום דרך PayPal אושר וההרשמה שלכם נשמרה.</p>
      </div>
    );
  }

  return (
    <div className="payment-success-message">
      <p className="payment-success-lead">התשלום בוצע בהצלחה!</p>
      <p>ההרשמה שלכם נשמרה.</p>
    </div>
  );
}

export default PaymentSuccessMessage;
