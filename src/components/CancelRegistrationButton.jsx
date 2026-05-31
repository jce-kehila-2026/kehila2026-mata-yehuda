import { useState } from "react";
import { apiPost } from "../services/api";

function CancelRegistrationButton({ paymentId, onCancelled }) {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCancel = async () => {
    if (!paymentId) {
      alert("לא נמצא מזהה הרשמה. אנא פנו לעמותה.");
      return;
    }

    const confirmed = window.confirm(
      "האם אתה בטוח שברצונך לבטל את ההרשמה?\nפעולה זו אינה ניתנת לביטול."
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
        <h3 className="cancel-success-title">הביטול בוצע בהצלחה</h3>
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
      className="cancel-registration-btn"
      onClick={handleCancel}
      disabled={loading || !paymentId}
    >
      {loading ? "מבטל הרשמה..." : "ביטול הרשמה"}
    </button>
  );
}

export default CancelRegistrationButton;
