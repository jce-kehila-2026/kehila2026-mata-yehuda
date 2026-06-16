import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DonationAmountPicker from "./DonationAmountPicker";
import DonationSuccessMessage from "./DonationSuccessMessage";
import {
  DONATION_PAYMENT_METHODS,
  DONATION_STORAGE_KEYS,
} from "../config/donations";
import {
  createDonationPayPalOrder,
  saveDonationBitPayment,
  saveDonationCashPayment,
} from "../services/donationService";
import { formatDisplayPrice } from "../../services/Payment/formatPrice";

const EMPTY_DONOR = {
  firstName: "",
  phone: "",
  paymentMethod: "",
};

function resolveDonationAmount(selectedAmount, customAmount) {
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

function DonationForm({ initialAmount = null, showBackToHome = false }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialAmount ? 2 : 1);
  const [selectedAmount, setSelectedAmount] = useState(initialAmount);
  const [customAmount, setCustomAmount] = useState("");
  const [donor, setDonor] = useState(EMPTY_DONOR);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedMethod, setCompletedMethod] = useState("");

  const donationAmount = useMemo(
    () => resolveDonationAmount(selectedAmount, customAmount),
    [selectedAmount, customAmount]
  );

  const handleSelectPreset = (amount) => {
    if (amount === "other") {
      setSelectedAmount("other");
      setCustomAmount("");
      return;
    }

    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value) => {
    const sanitized = value.replace(/[^\d.]/g, "");
    setCustomAmount(sanitized);
    setSelectedAmount("other");
  };

  const handleDonorChange = (event) => {
    const { name, value } = event.target;
    let filtered = value;

    if (name === "phone") {
      filtered = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "firstName") {
      filtered = value.replace(/[^\u0590-\u05FFa-zA-Z\s'-]/g, "");
    }

    setDonor((prev) => ({ ...prev, [name]: filtered }));
  };

  const validateDonor = () => {
    if (!donor.firstName.trim()) {
      return "אנא הזינו שם";
    }

    if (!/^0\d{8,9}$/.test(donor.phone)) {
      return "אנא הזינו מספר טלפון תקין";
    }

    if (!donor.paymentMethod) {
      return "אנא בחרו שיטת תשלום";
    }

    return null;
  };

  const goToPaymentStep = () => {
    setFormError("");

    if (!donationAmount) {
      setFormError("אנא בחרו סכום תרומה");
      return;
    }

    setStep(2);
  };

  const persistDonationContext = () => {
    localStorage.setItem(DONATION_STORAGE_KEYS.amount, String(donationAmount));
    localStorage.setItem(DONATION_STORAGE_KEYS.firstName, donor.firstName.trim());
    localStorage.setItem(DONATION_STORAGE_KEYS.phone, donor.phone);
    localStorage.setItem(
      DONATION_STORAGE_KEYS.paymentMethod,
      donor.paymentMethod
    );
  };

  const handleSubmitDonation = async (event) => {
    event.preventDefault();
    setFormError("");

    const donorError = validateDonor();
    if (donorError) {
      setFormError(donorError);
      return;
    }

    if (!donationAmount) {
      setFormError("סכום תרומה לא תקין");
      return;
    }

    const payload = {
      firstName: donor.firstName.trim(),
      phone: donor.phone,
      amount: donationAmount,
      paymentMethod: donor.paymentMethod,
    };

    setIsSubmitting(true);

    try {
      if (donor.paymentMethod === "cash") {
        const { data } = await saveDonationCashPayment(payload);

        if (data.success && data.donationId) {
          localStorage.setItem(DONATION_STORAGE_KEYS.donationId, data.donationId);
          setCompletedMethod("cash");
          setStep(3);
        } else {
          setFormError(data.message || "שגיאה בשמירת התרומה");
        }
      } else if (donor.paymentMethod === "bit") {
        const { data } = await saveDonationBitPayment(payload);

        if (data.success && data.donationId) {
          localStorage.setItem(DONATION_STORAGE_KEYS.donationId, data.donationId);
          setCompletedMethod("bit");
          setStep(3);
        } else {
          setFormError(data.message || "שגיאה בשמירת התרומה");
        }
      } else if (
        donor.paymentMethod === "paypal" ||
        donor.paymentMethod === "credit card"
      ) {
        const { response, data } = await createDonationPayPalOrder(donationAmount);

        if (data?.success === false && data?.message) {
          setFormError(data.message);
          return;
        }

        if (!response.ok || !data?.links) {
          setFormError(
            data?.message ||
              "לא ניתן לפתוח תשלום PayPal. ודאו שהשרת רץ."
          );
          return;
        }

        const approveLink = data.links.find((link) => link.rel === "approve");
        if (!approveLink) {
          setFormError("לא נמצא קישור לאישור תשלום ב-PayPal.");
          return;
        }

        persistDonationContext();
        window.location.href = approveLink.href;
      } else {
        setFormError("אנא בחרו שיטת תשלום");
      }
    } catch (error) {
      console.error(error);
      setFormError(error.message || "שגיאה בחיבור לשרת");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <section className="community-section donation-flow">
        <DonationSuccessMessage paymentMethod={completedMethod} />
        <div className="community-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            חזרה למסך הראשי
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="community-section donation-flow">
      <form className="donation-form" onSubmit={handleSubmitDonation}>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        {step === 1 && (
          <>
            <h2 className="step-panel-title">בחרו סכום תרומה</h2>
            <p className="step-panel-hint">
              התרומה שלכם עוזרת לנו להמשיך ולתמוך בקהילת הוותיקים
            </p>

            <DonationAmountPicker
              selectedAmount={selectedAmount}
              customAmount={customAmount}
              onSelectPreset={handleSelectPreset}
              onCustomAmountChange={handleCustomAmountChange}
            />

            {donationAmount && (
              <p className="donation-selected-summary">
                סכום נבחר:{" "}
                <strong>{formatDisplayPrice(donationAmount)}</strong>
              </p>
            )}

            <div className="community-actions form-actions">
              {showBackToHome && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => navigate("/")}
                >
                  חזרה
                </button>
              )}
              <button
                type="button"
                className="primary-btn"
                onClick={goToPaymentStep}
              >
                לתרום
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="step-panel-title">איך תרצו לתרום?</h2>
            <p className="step-panel-hint">
              סכום התרומה:{" "}
              <strong>{formatDisplayPrice(donationAmount)}</strong>
            </p>

            <fieldset className="payment-methods">
              <legend className="visually-hidden">שיטת תשלום</legend>
              <div className="payment-methods-grid">
                {DONATION_PAYMENT_METHODS.map(({ value, label }) => (
                  <label key={value} className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={donor.paymentMethod === value}
                      onChange={handleDonorChange}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-field">
              <label className="form-label" htmlFor="donation-first-name">
                שם
              </label>
              <input
                id="donation-first-name"
                type="text"
                name="firstName"
                placeholder="לדוגמה: יוסי"
                value={donor.firstName}
                onChange={handleDonorChange}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="donation-phone">
                טלפון
              </label>
              <input
                id="donation-phone"
                type="tel"
                name="phone"
                placeholder="05XXXXXXXX"
                value={donor.phone}
                onChange={handleDonorChange}
                maxLength={10}
                inputMode="numeric"
              />
            </div>

            <div className="community-actions form-actions form-actions--split">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setFormError("");
                  setStep(1);
                }}
              >
                חזרה
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "שולח..." : "אישור תרומה"}
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  );
}

export default DonationForm;
