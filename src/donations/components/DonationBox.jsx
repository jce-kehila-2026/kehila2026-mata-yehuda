import { useNavigate } from "react-router-dom";
import DonationAmountPicker from "./DonationAmountPicker";
import { formatDisplayPrice } from "../../services/Payment/formatPrice";
import { getDonationAmountValidation, resolveDonationAmount } from "../utils/donationAmount";
import { useMemo, useState } from "react";
import "../styles/donations.css";

const DONATION_JAR_IMAGE =
  "/images/community-staff-dashboard/donations.png";

function DonationBox() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");

  const amount = useMemo(
    () => resolveDonationAmount(selectedAmount, customAmount),
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

    const { amount: validAmount, error: amountError } =
      getDonationAmountValidation(selectedAmount, customAmount);

    if (!validAmount) {
      setError(amountError);
      return;
    }

    navigate(`/donations?amount=${validAmount}`);
  };

  return (
    <div className="donation-box-section">
      <form
        className="donation-box donation-box--home"
        onSubmit={(event) => {
          event.preventDefault();
          handleDonate();
        }}
      >
        <div className="donation-box__content">
          <h2 className="donation-box__title">
            <span className="donation-box__heart" aria-hidden="true">
              ♡
            </span>
            תרומות
          </h2>

          <p className="donation-box__intro">
            תרומתכם מאפשרת לנו להמשיך ולספק שירותים, תמיכה ופעילות לקהילת
            הוותיקים.
          </p>
          <p className="donation-box__intro donation-box__intro--secondary">
            כל תרומה עושה הבדל ומשפיעה על איכות החיים של רבים.
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

          <button
            type="submit"
            className="donation-box__submit"
          >
            <span className="donation-box__submit-heart" aria-hidden="true">
              ♡
            </span>
            לתרום
          </button>
        </div>

        <div className="donation-box__visual" aria-hidden="true">
          <img
            className="donation-box__jar-art"
            src={DONATION_JAR_IMAGE}
            alt=""
          />
        </div>
      </form>
    </div>
  );
}

export default DonationBox;
