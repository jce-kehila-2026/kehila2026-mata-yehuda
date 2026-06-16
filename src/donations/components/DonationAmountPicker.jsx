import { DONATION_PRESET_AMOUNTS } from "../config/donations";
import { formatDisplayPrice } from "../../services/Payment/formatPrice";

function DonationAmountPicker({
  selectedAmount,
  customAmount,
  onSelectPreset,
  onCustomAmountChange,
  compact = false,
}) {
  const showCustomInput =
    selectedAmount === "other" || customAmount !== "";

  return (
    <div className={`donation-amount-picker${compact ? " donation-amount-picker--compact" : ""}`}>
      <div className="donation-amount-grid">
        {DONATION_PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`donation-amount-btn${
              selectedAmount === amount ? " is-selected" : ""
            }`}
            onClick={() => onSelectPreset(amount)}
          >
            {formatDisplayPrice(amount)}
          </button>
        ))}
        <button
          type="button"
          className={`donation-amount-btn donation-amount-btn--other${
            selectedAmount === "other" || customAmount !== "" ? " is-selected" : ""
          }`}
          onClick={() => onSelectPreset("other")}
        >
          סכום אחר
        </button>
      </div>

      {showCustomInput && (
        <div className="donation-custom-amount">
          <label htmlFor="donation-custom-amount-input">הזינו סכום (₪)</label>
          <input
            id="donation-custom-amount-input"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="לדוגמה: 75"
            value={customAmount}
            onChange={(e) => onCustomAmountChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export default DonationAmountPicker;
