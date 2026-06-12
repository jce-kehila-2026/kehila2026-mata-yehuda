import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../services/Payment/api";

function CancelRegistrationButton({
  paymentId,
  onCancelled,
  buttonLabel = "אישור ביטול ההרשמה",
  compact = false,
  className = "",
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCancelClick = () => {
    setErrorMessage("");

    if (!paymentId) {
      setErrorMessage("לא נמצא מזהה הרשמה. אנא פנו לעמותה.");
      return;
    }

    setConfirming(true);
  };

  const handleConfirmCancel = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      const { data } = await apiPost("/cancel-registration", { paymentId });

      if (data.success) {
        localStorage.removeItem("registrationPaymentId");
        localStorage.removeItem("registrationPaymentMethod");
        setConfirming(false);

        if (compact) {
          onCancelled?.({ message: data.message, paymentId });
          return;
        }

        setSuccessMessage(data.message);
      } else {
        setConfirming(false);
        setErrorMessage(data.message || "ביטול ההרשמה נכשל");
      }
    } catch (error) {
      console.error(error);
      setConfirming(false);
      setErrorMessage(error.message || "שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  const handleDismissConfirm = () => {
    if (!loading) {
      setConfirming(false);
      setErrorMessage("");
    }
  };

  const handleBackHome = () => {
    setSuccessMessage(null);
    onCancelled?.();
    navigate("/");
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

  if (confirming) {
    return (
      <div className="cancel-confirm-box">
        <p className="cancel-confirm-text">
          האם לאשר ביטול ההרשמה? לאחר האישור לא ניתן לשחזר את ההרשמה.
        </p>
        <div className="cancel-confirm-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={handleConfirmCancel}
            disabled={loading}
          >
            {loading ? "מעבד..." : "אישור ביטול"}
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleDismissConfirm}
            disabled={loading}
          >
            לא, חזרה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cancel-registration-wrap">
      {errorMessage && (
        <p className="cancel-registration-error" role="alert">
          {errorMessage}
        </p>
      )}
      <button
        type="button"
        className={`cancel-registration-btn${className ? ` ${className}` : ""}`}
        onClick={handleCancelClick}
        disabled={loading || !paymentId}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default CancelRegistrationButton;
