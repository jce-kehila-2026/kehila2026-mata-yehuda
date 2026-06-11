import { useState } from "react";
import { apiPost } from "../../services/Payment/api";

function CancelRegistrationButton({
  paymentId,
  onCancelled,
  buttonLabel = "אישור ביטול ההרשמה",
  compact = false,
  className = "",
}) {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCancel = async () => {
    if (!paymentId) {
      alert("לא נמצא מזהה הרשמה. אנא פנו לעמותה.");
      return;
    }

    const confirmed = window.confirm(
      "האם לאשר ביטול ההרשמה?\nלאחר האישור לא ניתן לשחזר את ההרשמה."
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await apiPost("/cancel-registration", { paymentId });

      if (data.success) {
        localStorage.removeItem("registrationPaymentId");
        localStorage.removeItem("registrationPaymentMethod");
        if (compact) {
          onCancelled?.({ message: data.message, paymentId });
          return;
        }
        setSuccessMessage(data.message);
      } else {
        alert(data.message || "ביטול ההרשמה נכשל");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  const handleBackHome = () => {
    setSuccessMessage(null);
    onCancelled?.();
  };

  if (successMessage) {
    return (
      <div className="cancel-success-screen">
        <h3 className="cancel-success-title">בקשת הביטול התקבלה</h3>
        <p className="cancel-success-message">{successMessage}</p>
        <button type="button" className="secondary-btn" onClick={handleBackHome}>
          חזרה למסך הראשי
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`cancel-registration-btn${className ? ` ${className}` : ""}`}
      onClick={handleCancel}
      disabled={loading || !paymentId}
    >
      {loading ? "מעבד..." : buttonLabel}
    </button>
  );
}

export default CancelRegistrationButton;
