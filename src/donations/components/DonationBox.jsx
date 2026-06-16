import { useNavigate } from "react-router-dom";
import DonationAmountPicker from "./DonationAmountPicker";
import { formatDisplayPrice } from "../../services/Payment/formatPrice";
import { useMemo, useState } from "react";
import "../styles/donations.css";

function resolveAmount(selectedAmount, customAmount) {
  if (customAmount !== "") {
    const parsed = Number(customAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }
    return Math.round(parsed * 100) / 100;
  }

  if (typeof selectedAmount === "number" && selectedAmount > 0) {
    return selectedAmount;
  }

  return null;
}

function DonationBox() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");

  const amount = useMemo(
    () => resolveAmount(selectedAmount, customAmount),
    [selectedAmount, customAmount]
  );

  const handleSelectPreset = (value) => {
    if (value === "other") {
      setSelectedAmount("other");
      setCustomAmount("");
      return;
    }

    setSelectedAmount(value);
    setCustomAmount("");
  };

  const handleDonate = () => {
    setError("");

    if (!amount) {
      setError("אנא בחרו סכום תרומה");
      return;
    }

    navigate(`/donations?amount=${amount}`);
  };

  return (
    <div className="donation-box-section">
      <div className="donation-box">
        <h2>תרומות</h2>
        <p className="donation-box__intro">
          תרומתכם מאפשרת לנו להמשיך ולספק שירות, תמיכה ופעילות לקהילת הוותיקים.
        </p>

        {error && (
          <div className="form-message error" role="alert">
            {error}
          </div>
        )}

        <DonationAmountPicker
          compact
          selectedAmount={selectedAmount}
          customAmount={customAmount}
          onSelectPreset={handleSelectPreset}
          onCustomAmountChange={(value) => {
            setCustomAmount(value.replace(/[^\d.]/g, ""));
            setSelectedAmount("other");
          }}
        />

        {amount && (
          <p className="donation-box__summary">
            סכום נבחר: <strong>{formatDisplayPrice(amount)}</strong>
          </p>
        )}

        <button type="button" className="donation-box__submit" onClick={handleDonate}>
          לתרום
        </button>
      </div>
    </div>
  );
}

export default DonationBox;
