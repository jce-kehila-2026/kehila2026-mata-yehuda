import { useState } from "react";

const API_BASE = "http://localhost:5001";

function CancelRegistrationButton({ paymentId, onCancelled }) {
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`${API_BASE}/cancel-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem("registrationPaymentId");
        alert(data.message);
        onCancelled?.();
      } else {
        alert(data.message || "ביטול ההרשמה נכשל");
      }
    } catch (error) {
      console.error(error);
      alert("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

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
