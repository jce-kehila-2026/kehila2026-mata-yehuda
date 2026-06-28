import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CancelRegistrationButton from "../CancelTheRegistration/CancelRegistrationButton";
import PaymentSuccessMessage from "./PaymentSuccessMessage";
import PaymentNotificationOptIn from "./PaymentNotificationOptIn";
import PaymentFlowActions from "./PaymentFlowActions";
import PaymentFlowShell from "./PaymentFlowShell";
import PaymentStepHeader from "./PaymentStepHeader";
import RegistrationStepper, { REGISTRATION_STEPS } from "./RegistrationStepper";
import {
  validateIsraeliId,
  validateRegistrationDetails,
  validateRegistrationForm,
} from "../../services/Payment/validation";
import { apiPost } from "../../services/Payment/api.js";
import { formatActivityPrice, formatDisplayPrice } from "../../services/Payment/formatPrice";
import { notifyRegistrationBlock } from "../../services/Payment/registrationErrors";
import { checkParticipantByIdNumber } from "../../services/Payment/participantService";

const EMPTY_FORM_DATA = {
  firstName: "",
  idNumber: "",
  phone: "",
  paymentMethod: "",
};

const PAYMENT_METHOD_LABELS = {
  "credit card": "כרטיס אשראי",
  paypal: "PayPal",
  bit: "Bit",
  cash: "מזומן",
  free: "ללא תשלום",
};

const FREE_REGISTRATION_STEPS = [
  { id: "id-check", label: "ת.ז." },
  { id: "details", label: "פרטים אישיים" },
  { id: "success", label: "סיום" },
];

function PaymentForm({
  onRegistrationCancelled,
  activityId = "",
  programId = "",
  paymentInfo = null,
  registrationOnly = false,
  showLookupScreen: showLookupScreenProp = false,
  onLookupScreenChange,
  onLookupBack,
  lookupBackLabel: lookupBackLabelOverride,
}) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedPaymentId, setCompletedPaymentId] = useState(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(true);
  const [completedPaymentMethod, setCompletedPaymentMethod] = useState("");
  const [lookupScreenInternal, setLookupScreenInternal] = useState(false);
  const showLookupScreen = onLookupScreenChange
    ? showLookupScreenProp
    : lookupScreenInternal;
  const setShowLookupScreen = onLookupScreenChange ?? setLookupScreenInternal;
  const [lookupIdNumber, setLookupIdNumber] = useState("");
  const [lookupStatus, setLookupStatus] = useState(null);
  const [lookupRegistrations, setLookupRegistrations] = useState([]);
  const [lookupCancelMessage, setLookupCancelMessage] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  const isFreeActivity =
    Boolean(paymentInfo?.isFree) ||
    paymentInfo?.price == null ||
    paymentInfo?.price === "" ||
    Number(paymentInfo?.price) === 0;
  const activeSteps = isFreeActivity
    ? FREE_REGISTRATION_STEPS
    : REGISTRATION_STEPS;
  const successStep = activeSteps.length;
  const lookupBackLabel =
    lookupBackLabelOverride ??
    (registrationOnly || !paymentInfo ? "חזרה" : "חזרה להרשמה");

  const saveCompletedRegistration = (paymentId, paymentMethod) => {
    localStorage.setItem("registrationPaymentId", paymentId);
    localStorage.setItem("registrationPaymentMethod", paymentMethod);
    setCompletedPaymentId(paymentId);
    setCompletedPaymentMethod(paymentMethod);
    setShowPaymentConfirmation(true);
    setCurrentStep(successStep);
  };

  const clearCompletedRegistration = () => {
    localStorage.removeItem("registrationPaymentId");
    localStorage.removeItem("registrationPaymentMethod");
    setCompletedPaymentId(null);
    setCompletedPaymentMethod("");
    setShowPaymentConfirmation(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;

    if (name === "phone") {
      filtered = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "idNumber") {
      filtered = value.replace(/\D/g, "").slice(0, 9);
    } else if (name === "firstName") {
      filtered = value.replace(/[^\u0590-\u05FFa-zA-Z\s'-]/g, "");
    }

    setFormData({ ...formData, [name]: filtered });
  };

  const handleLookupIdNumberChange = (e) => {
    setLookupIdNumber(e.target.value.replace(/\D/g, "").slice(0, 9));
  };

  const formatRegistrationDate = (timestampMs) => {
    if (!timestampMs) {
      return "";
    }
    return new Date(timestampMs).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const goToIdCheckStep = () => {
    setFormError("");
    setIdCheckMessage("");
    setCurrentStep(1);
  };

  const goToDetailsStep = () => {
    setFormError("");
    setCurrentStep(2);
  };

  const verifyIdAndContinue = async () => {
    setFormError("");
    setIdCheckMessage("");

    const idValidation = validateIsraeliId(formData.idNumber);
    if (!idValidation.valid) {
      setFormError(idValidation.message);
      return;
    }

    setIsCheckingId(true);

    try {
      const data = await checkParticipantByIdNumber(idValidation.idNumber);

      setFormData((prev) => ({
        ...prev,
        idNumber: idValidation.idNumber,
        firstName: data.exists ? data.participant?.firstName || "" : "",
        phone: data.exists ? data.participant?.phone || "" : "",
      }));

      setIdCheckMessage(
        data.exists
          ? "נמצאתם במערכת! אפשר לעדכן את הפרטים בשלב הבא."
          : "מספר הת.ז. לא נמצא במערכת — נשלים פרטים אישיים.",
      );
      setCurrentStep(2);
    } catch (error) {
      console.error(error);
      setFormError(error.message || "שגיאה בבדיקת תעודת זהות");
    } finally {
      setIsCheckingId(false);
    }
  };

  const goToPaymentMethodStep = () => {
    setFormError("");
    const validation = validateRegistrationDetails(formData);
    if (!validation.valid) {
      setFormError(validation.message);
      return;
    }
    setCurrentStep(3);
  };

  const goToPaymentStep = () => {
    setFormError("");
    if (!formData.paymentMethod) {
      setFormError("אנא בחרו שיטת תשלום");
      return;
    }
    setCurrentStep(4);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      await verifyIdAndContinue();
      return;
    }

    if (currentStep === 2) {
      if (isFreeActivity) {
        await handleFreeRegistration();
        return;
      }
      goToPaymentMethodStep();
      return;
    }

    if (currentStep === 3) {
      goToPaymentStep();
      return;
    }

    if (currentStep === 4) {
      await handlePayment(e);
    }
  };

  const handleFreeRegistration = async () => {
    setFormError("");

    const validation = validateRegistrationDetails(formData);
    if (!validation.valid) {
      setFormError(validation.message);
      return;
    }

    const { firstName, idNumber, phone } = validation;

    if (!paymentInfo?.activityId) {
      setFormError("לא נטענו פרטי פעילות. בדקו את הקישור להרשמה.");
      return;
    }

    const resolvedProgramId =
      programId || paymentInfo.programId || "";

    const registrationPayload = {
      firstName,
      idNumber,
      phone,
      activityId: paymentInfo.activityId,
      programId: resolvedProgramId || undefined,
    };

    const persistRegistrationContext = () => {
      localStorage.setItem("paymentAmount", "0");
      localStorage.setItem("paymentCurrency", paymentInfo.currency);
      localStorage.setItem("activityTitle", paymentInfo.title);
      if (activityId) {
        localStorage.setItem("activityId", activityId);
      }
      if (resolvedProgramId) {
        localStorage.setItem("programId", resolvedProgramId);
      }
    };

    setIsSubmitting(true);

    try {
      const { response, data } = await apiPost(
        "/save-free-registration",
        registrationPayload
      );

      if (response.status === 404) {
        setFormError(
          "שרת התשלומים לא מעודכן. הפעילו מחדש: cd server && npm run start:payment"
        );
        return;
      }

      if (data.success && data.paymentId) {
        persistRegistrationContext();
        saveCompletedRegistration(data.paymentId, "free");
      } else {
        notifyRegistrationBlock(
          data.message || "הייתה שגיאה בהשלמת ההרשמה",
          setFormError
        );
      }
    } catch (error) {
      console.error(error);
      setFormError(error.message || "שגיאה בחיבור לשרת");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setFormError("");

    const validation = validateRegistrationForm(formData);
    if (!validation.valid) {
      setFormError(validation.message);
      return;
    }

    const { firstName, idNumber, phone } = validation;

    if (!paymentInfo?.activityId) {
      setFormError("לא נטענו פרטי פעילות. בדקו את הקישור לתשלום.");
      return;
    }

    const resolvedProgramId =
      programId || paymentInfo.programId || "";

    const paymentPayload = {
      firstName,
      idNumber,
      phone,
      activityId: paymentInfo.activityId,
      programId: resolvedProgramId || undefined,
    };

    const persistPaymentContext = () => {
      localStorage.setItem("paymentAmount", String(paymentInfo.price));
      localStorage.setItem("paymentCurrency", paymentInfo.currency);
      localStorage.setItem("activityTitle", paymentInfo.title);
      if (activityId) {
        localStorage.setItem("activityId", activityId);
      }
      if (resolvedProgramId) {
        localStorage.setItem("programId", resolvedProgramId);
      }
    };

    setIsSubmitting(true);

    try {
      if (formData.paymentMethod === "cash") {
        const { data } = await apiPost("/save-cash-payment", {
          ...paymentPayload,
          paymentMethod: "cash",
        });

        if (data.success && data.paymentId) {
          persistPaymentContext();
          saveCompletedRegistration(data.paymentId, "cash");
        } else {
          notifyRegistrationBlock(
            data.message || "הייתה שגיאה בשמירת ההרשמה",
            setFormError
          );
        }
      } else if (
        formData.paymentMethod === "paypal" ||
        formData.paymentMethod === "credit card"
      ) {
        const { response, data } = await apiPost("/create-paypal-order", {
          activityId: paymentInfo.activityId,
          idNumber,
        });

        if (data?.success === false && data?.message) {
          notifyRegistrationBlock(data.message, setFormError);
          return;
        }

        if (!response.ok || !data?.links) {
          notifyRegistrationBlock(
            data?.message ||
              "לא ניתן לפתוח תשלום PayPal. בדקו שהשרת רץ ושהגדרות PayPal ב-.env תקינות.",
            setFormError
          );
          return;
        }

        const approveLink = data.links.find((link) => link.rel === "approve");
        if (!approveLink) {
          setFormError("לא נמצא קישור לאישור תשלום ב-PayPal.");
          return;
        }

        localStorage.setItem("firstName", firstName);
        localStorage.setItem("idNumber", idNumber);
        localStorage.setItem("phone", phone);
        persistPaymentContext();
        localStorage.setItem(
          "registrationPaymentMethod",
          formData.paymentMethod
        );
        window.location.href = approveLink.href;
      } else if (formData.paymentMethod === "bit") {
        const { data } = await apiPost("/save-bit-payment", {
          ...paymentPayload,
          paymentMethod: "bit",
        });

        if (data.success && data.paymentId) {
          persistPaymentContext();
          saveCompletedRegistration(data.paymentId, "bit");
        } else {
          notifyRegistrationBlock(
            data.message || "הייתה שגיאה בשמירת ההרשמה",
            setFormError
          );
        }
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

  const resetLookupFormState = () => {
    setLookupIdNumber("");
    setLookupStatus(null);
    setLookupRegistrations([]);
    setLookupCancelMessage("");
    setLookupError("");
    setLookupLoading(false);
  };

  const closeLookupScreen = () => {
    resetLookupFormState();

    if (onLookupBack) {
      onLookupBack();
      return;
    }

    setShowLookupScreen(false);
  };

  const resetLookupSearch = () => {
    setLookupStatus(null);
    setLookupRegistrations([]);
    setLookupCancelMessage("");
    setLookupError("");
    setLookupIdNumber("");
  };

  const handleLookupRegistrationCancelled = ({ message, paymentId }) => {
    setLookupRegistrations((prev) =>
      prev.filter((registration) => registration.paymentId !== paymentId)
    );
    setLookupCancelMessage(message || "הביטול בוצע בהצלחה.");
    clearCompletedRegistration();
    onRegistrationCancelled?.();
  };

  const searchRegistrationsByIdNumber = async () => {
    const idValidation = validateIsraeliId(lookupIdNumber);
    if (!idValidation.valid) {
      setLookupError(idValidation.message);
      return;
    }

    setLookupLoading(true);
    setLookupStatus(null);
    setLookupRegistrations([]);
    setLookupCancelMessage("");
    setLookupError("");

    try {
      const { response, data } = await apiPost("/find-active-registration", {
        idNumber: idValidation.idNumber,
      });

      if (!response.ok) {
        setLookupError(data?.message || "שגיאה בחיפוש הרשמות");
        return;
      }

      if (
        data.success &&
        Array.isArray(data.registrations) &&
        data.registrations.length > 0
      ) {
        setLookupRegistrations(data.registrations);
        setLookupStatus("found");
      } else {
        setLookupStatus("not_found");
        if (data?.message) {
          setLookupError(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      setLookupError(error.message || "שגיאה בחיבור לשרת");
    } finally {
      setLookupLoading(false);
    }
  };

  const goToHomeScreen = () => {
    setShowPaymentConfirmation(false);
    setCompletedPaymentId(null);
    setCompletedPaymentMethod("");
    setFormData(EMPTY_FORM_DATA);
    setCurrentStep(1);
    setShowLookupScreen(false);
    setLookupIdNumber("");
    setLookupStatus(null);
    setLookupRegistrations([]);
    setLookupCancelMessage("");
    setFormError("");
    setIdCheckMessage("");
    setIsCheckingId(false);
    localStorage.removeItem("firstName");
    localStorage.removeItem("idNumber");
    localStorage.removeItem("phone");
    navigate("/");
  };

  const submitLabel =
    formData.paymentMethod === "paypal" ||
    formData.paymentMethod === "credit card"
      ? "מעבר לתשלום מאובטח"
      : "השלמת הרשמה";

  if (completedPaymentId && showPaymentConfirmation && !showLookupScreen) {
    return (
      <PaymentFlowShell>
        <RegistrationStepper currentStep={successStep} steps={activeSteps} />
        <PaymentStepHeader title="סיום" hint="ההרשמה הושלמה בהצלחה" />
        <PaymentSuccessMessage paymentMethod={completedPaymentMethod} />
        <PaymentFlowActions>
          <button type="button" className="secondary-btn" onClick={goToHomeScreen}>
            חזרה למסך הראשי
          </button>
        </PaymentFlowActions>
      </PaymentFlowShell>
    );
  }

  if (showLookupScreen) {
    const showSuccessScreen =
      lookupStatus === "found" &&
      lookupRegistrations.length === 0 &&
      lookupCancelMessage;

    const cancelSubtitle =
      lookupStatus === "found"
        ? "בחרו את ההרשמה שברצונכם לבטל."
        : "הזינו מספר תעודת זהות כדי למצוא הרשמות פעילות ולבטל אותן.";

    const isIdSearchView =
      lookupStatus !== "found" && lookupStatus !== "not_found";

    return (
      <PaymentFlowShell>
        {showSuccessScreen ? (
          <>
            <PaymentStepHeader
              title="הבקשה התקבלה"
              hint={lookupCancelMessage}
            />
            <PaymentFlowActions>
              <button
                type="button"
                className="primary-btn payment-flow-btn"
                onClick={resetLookupSearch}
              >
                חיפוש עם ת.ז. אחרת
                <span className="payment-flow-btn__chevron" aria-hidden="true">
                  ‹
                </span>
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={closeLookupScreen}
              >
                {lookupBackLabel}
              </button>
            </PaymentFlowActions>
          </>
        ) : (
          <>
            <PaymentStepHeader
              title="ביטול הרשמה"
              hint={cancelSubtitle}
              showLeafDecoration={isIdSearchView}
            />

            {lookupError && lookupStatus !== "found" && lookupStatus !== "not_found" && (
              <p className="form-error" role="alert">
                {lookupError}
              </p>
            )}

            {lookupStatus === "found" && lookupRegistrations.length > 0 && (
              <>
                <p className="lookup-success">
                  נמצאו {lookupRegistrations.length} הרשמות פעילות.
                </p>
                {lookupCancelMessage && (
                  <p className="lookup-success">{lookupCancelMessage}</p>
                )}
                <ul className="lookup-registrations-list">
                  {lookupRegistrations.map((registration) => (
                    <li
                      key={registration.paymentId}
                      className="lookup-registration-item"
                    >
                      <div className="lookup-registration-details">
                        <p className="lookup-registration-title">
                          <strong>
                            {registration.activityTitle || "הרשמה לפעילות"}
                          </strong>
                        </p>
                        {registration.createdAt > 0 && (
                          <p className="lookup-registration-meta">
                            תאריך הרשמה:{" "}
                            {formatRegistrationDate(registration.createdAt)}
                          </p>
                        )}
                        <p className="lookup-registration-meta">
                          שיטת תשלום:{" "}
                          {PAYMENT_METHOD_LABELS[registration.paymentMethod] ||
                            registration.paymentMethod ||
                            "—"}
                        </p>
                        {registration.amount != null && (
                          <p className="lookup-registration-meta">
                            סכום:{" "}
                            {formatActivityPrice(
                    registration.amount,
                    registration.currency
                  )}
                          </p>
                        )}
                      </div>
                      <CancelRegistrationButton
                        paymentId={registration.paymentId}
                        buttonLabel="ביטול הרשמה"
                        compact
                        className="primary-btn lookup-registration-cancel-btn"
                        onCancelled={handleLookupRegistrationCancelled}
                      />
                    </li>
                  ))}
                </ul>
                <PaymentFlowActions>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetLookupSearch}
                  >
                    חיפוש עם ת.ז. אחרת
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeLookupScreen}
                  >
                    {lookupBackLabel}
                  </button>
                </PaymentFlowActions>
              </>
            )}

            {lookupStatus === "found" &&
              lookupRegistrations.length === 0 &&
              !lookupCancelMessage && (
                <>
                  <p className="lookup-success">כל ההרשמות הפעילות בוטלו.</p>
                  <PaymentFlowActions>
                    <button
                      type="button"
                      className="primary-btn payment-flow-btn"
                      onClick={resetLookupSearch}
                    >
                      חיפוש עם ת.ז. אחרת
                      <span className="payment-flow-btn__chevron" aria-hidden="true">
                        ‹
                      </span>
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={closeLookupScreen}
                    >
                      {lookupBackLabel}
                    </button>
                  </PaymentFlowActions>
                </>
              )}

            {lookupStatus === "not_found" && (
              <>
                <p className="lookup-error" role="alert">
                  {lookupError || "לא נמצאו הרשמות פעילות למספר תעודת זהות זה."}
                </p>
                <PaymentFlowActions split>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeLookupScreen}
                  >
                    {lookupBackLabel}
                  </button>
                  <button
                    type="button"
                    className="primary-btn payment-flow-btn"
                    onClick={resetLookupSearch}
                  >
                    חיפוש עם מספר אחר
                    <span className="payment-flow-btn__chevron" aria-hidden="true">
                      ‹
                    </span>
                  </button>
                </PaymentFlowActions>
              </>
            )}

            {isIdSearchView && (
              <>
                <div className="form-field">
                  <label className="form-label" htmlFor="lookup-id-number">
                    מספר תעודת זהות
                  </label>
                  <div className="payment-input-wrap">
                    <span
                      className="payment-input-icon material-symbols-outlined"
                      aria-hidden="true"
                    >
                      badge
                    </span>
                    <input
                      id="lookup-id-number"
                      type="tel"
                      className="payment-input"
                      placeholder="9 ספרות"
                      value={lookupIdNumber}
                      onChange={handleLookupIdNumberChange}
                      disabled={lookupLoading}
                      maxLength={9}
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <PaymentFlowActions showLeafDecoration split>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeLookupScreen}
                    disabled={lookupLoading}
                  >
                    {lookupBackLabel}
                  </button>
                  <button
                    type="button"
                    className="primary-btn payment-flow-btn payment-flow-btn--leaf-left"
                    onClick={searchRegistrationsByIdNumber}
                    disabled={lookupLoading}
                  >
                    {lookupLoading ? "מחפש..." : "חיפוש הרשמות >"}
                  </button>
                </PaymentFlowActions>
              </>
            )}
          </>
        )}
      </PaymentFlowShell>
    );
  }

  if (!paymentInfo) {
    return null;
  }

  return (
    <PaymentFlowShell>
      <RegistrationStepper currentStep={currentStep} steps={activeSteps} />

      <form className="payment-form" onSubmit={handleFormSubmit}>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        {currentStep === 1 && (
          <>
            <PaymentStepHeader
              title="זיהוי לפי ת.ז."
              hint="הזינו את מספר תעודת הזהות – נבדוק אם אתם כבר רשומים במערכת"
              showLeafDecoration
            />

            <div className="form-field">
              <label className="form-label" htmlFor="idNumber">
                מספר תעודת זהות
              </label>
              <div className="payment-input-wrap">
                <span className="payment-input-icon material-symbols-outlined" aria-hidden="true">
                  badge
                </span>
                <input
                  id="idNumber"
                  type="tel"
                  name="idNumber"
                  className="payment-input"
                  placeholder="9 ספרות"
                  value={formData.idNumber}
                  onChange={handleChange}
                  maxLength={9}
                  inputMode="numeric"
                  disabled={isCheckingId}
                />
              </div>
            </div>

            {idCheckMessage && (
              <p className="lookup-success" role="status">
                {idCheckMessage}
              </p>
            )}

            <PaymentFlowActions showLeafDecoration>
              <button
                type="button"
                className="primary-btn payment-flow-btn payment-flow-btn--leaf-both"
                onClick={verifyIdAndContinue}
                disabled={isCheckingId}
              >
                {isCheckingId ? "בודק..." : "המשך"}
                <span className="payment-flow-btn__chevron" aria-hidden="true">
                  ‹
                </span>
              </button>
            </PaymentFlowActions>
          </>
        )}

        {currentStep === 2 && (
          <>
            <PaymentStepHeader
              title="פרטים אישיים"
              hint={
                isFreeActivity
                  ? "פעילות זו ללא תשלום — השלימו את הפרטים להרשמה"
                  : "השלימו או עדכנו את הפרטים של המשתתף/ת"
              }
            />

            <div className="form-field">
              <label className="form-label">מספר תעודת זהות</label>
              <p className="id-readonly" dir="ltr">
                {formData.idNumber}
              </p>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="firstName">
                שם פרטי
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="לדוגמה: יוסי"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="phone">
                טלפון נייד
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="05XXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
              />
            </div>

            <PaymentNotificationOptIn />

            <PaymentFlowActions split>
              <button type="button" className="secondary-btn" onClick={goToIdCheckStep}>
                חזרה
              </button>
              <button
                type="button"
                className="primary-btn payment-flow-btn"
                onClick={
                  isFreeActivity ? handleFreeRegistration : goToPaymentMethodStep
                }
                disabled={isSubmitting}
              >
                {isFreeActivity
                  ? isSubmitting
                    ? "שולח..."
                    : "השלמת הרשמה"
                  : "המשך"}
                <span className="payment-flow-btn__chevron" aria-hidden="true">
                  ‹
                </span>
              </button>
            </PaymentFlowActions>
          </>
        )}

        {currentStep === 3 && !isFreeActivity && (
          <>
            <PaymentStepHeader title="אמצעי תשלום" hint="בחרו כיצד תשלמו" />

            <fieldset className="payment-methods">
              <legend className="visually-hidden">שיטת תשלום</legend>
              <div className="payment-methods-grid">
                {[
                  ["credit card", "כרטיס אשראי"],
                  ["paypal", "PayPal"],
                  ["bit", "Bit"],
                  ["cash", "מזומן"],
                ].map(([value, label]) => (
                  <label key={value} className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={formData.paymentMethod === value}
                      onChange={handleChange}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <PaymentFlowActions split>
              <button type="button" className="secondary-btn" onClick={goToDetailsStep}>
                חזרה
              </button>
              <button
                type="button"
                className="primary-btn payment-flow-btn"
                onClick={goToPaymentStep}
              >
                המשך
                <span className="payment-flow-btn__chevron" aria-hidden="true">
                  ‹
                </span>
              </button>
            </PaymentFlowActions>
          </>
        )}

        {currentStep === 4 && !isFreeActivity && (
          <>
            <PaymentStepHeader title="אישור ותשלום" hint="בדקו את הפרטים ולחצו להשלמה" />

            <dl className="payment-summary">
              <div className="payment-summary__row">
                <dt>ת.ז.</dt>
                <dd dir="ltr">{formData.idNumber}</dd>
              </div>
              <div className="payment-summary__row">
                <dt>שם</dt>
                <dd>{formData.firstName}</dd>
              </div>
              <div className="payment-summary__row">
                <dt>טלפון</dt>
                <dd dir="ltr">{formData.phone}</dd>
              </div>
              <div className="payment-summary__row">
                <dt>אמצעי תשלום</dt>
                <dd>
                  {PAYMENT_METHOD_LABELS[formData.paymentMethod] ||
                    formData.paymentMethod}
                </dd>
              </div>
              <div className="payment-summary__row payment-summary__row--total">
                <dt>לתשלום</dt>
                <dd>
                  {formatActivityPrice(paymentInfo.price, paymentInfo.currency)}
                </dd>
              </div>
            </dl>

            <PaymentFlowActions split>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setFormError("");
                  setCurrentStep(3);
                }}
              >
                חזרה
              </button>
              <button
                type="submit"
                className="primary-btn payment-flow-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "שולח..." : submitLabel}
                <span className="payment-flow-btn__chevron" aria-hidden="true">
                  ‹
                </span>
              </button>
            </PaymentFlowActions>
          </>
        )}
      </form>
    </PaymentFlowShell>
  );
}

export default PaymentForm;
