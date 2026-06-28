import { useEffect, useState } from "react";
import {
  completeCommunityJoinRegistration,
  getVolunteerManagementLookups,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffSubscriptionFormFields, {
  buildSubscriptionFormValues,
  validateSubscriptionForm,
} from "./CommunityStaffSubscriptionFormFields.jsx";
import {
  INVALID_ADDRESS_MESSAGE,
  isValidAddress,
  nameContainsNumber,
} from "../../utils/nameValidation";

function formatBirthDateForInput(value) {
  if (!value) {
    return "";
  }

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function buildInitialForm(request) {
  const participant = request?.participant || {};

  return {
    first_name: participant.first_name || "",
    last_name: participant.last_name || "",
    id_number: participant.id_number || "",
    phone: participant.phone || "",
    birth_date: formatBirthDateForInput(participant.birth_date),
    gender: participant.gender || "",
    address: participant.address || "",
    emergency_number: participant.emergency_number || "",
    medical_notes: participant.medical_notes || "",
    mobility_limitations: participant.mobility_limitations || "",
    marketing_consent: Boolean(participant.marketing_consent),
    ...buildSubscriptionFormValues(request),
  };
}

const EMERGENCY_NUMBER_ERROR =
  "מספר חירום חייב להיות מספר טלפון נייד תקין המתחיל ב-05 ומכיל 10 ספרות";

function getEmergencyNumberError(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "נא למלא מספר חירום";
  }

  if (!/^05\d{8}$/.test(trimmedValue)) {
    return EMERGENCY_NUMBER_ERROR;
  }

  return "";
}

function validateParticipantForm(form) {
  if (!form.first_name.trim()) {
    return "נא למלא שם פרטי";
  }

  if (nameContainsNumber(form.first_name)) {
    return "שם פרטי אינו יכול להכיל מספרים";
  }

  if (!form.last_name.trim()) {
    return "נא למלא שם משפחה";
  }

  if (nameContainsNumber(form.last_name)) {
    return "שם משפחה אינו יכול להכיל מספרים";
  }

  if (!form.id_number.trim()) {
    return "נא למלא מספר תעודת זהות";
  }

  if (!/^\d{9}$/.test(form.id_number.trim())) {
    return "מספר תעודת זהות חייב להיות בן 9 ספרות";
  }

  if (!form.phone.trim()) {
    return "נא למלא מספר טלפון";
  }

  if (!form.birth_date) {
    return "נא למלא תאריך לידה";
  }

  if (!form.gender) {
    return "נא לבחור מין";
  }

  if (!form.address.trim()) {
    return "נא למלא כתובת";
  }

  if (!isValidAddress(form.address)) {
    return INVALID_ADDRESS_MESSAGE;
  }

  const emergencyNumberError = getEmergencyNumberError(form.emergency_number);

  if (emergencyNumberError) {
    return emergencyNumberError;
  }

  return "";
}

function splitFormData(form) {
  return {
    participantData: {
      first_name: form.first_name,
      last_name: form.last_name,
      id_number: form.id_number,
      phone: form.phone,
      birth_date: form.birth_date,
      gender: form.gender,
      address: form.address,
      emergency_number: form.emergency_number,
      medical_notes: form.medical_notes,
      mobility_limitations: form.mobility_limitations,
      marketing_consent: form.marketing_consent,
    },
    subscriptionData: {
      monthlyPrice: form.monthlyPrice,
      requestedServices: form.requestedServices,
      languages: form.languages,
      otherService: form.otherService,
    },
  };
}

function CompleteCommunityJoinModal({ request, onClose, onSaved }) {
  const [form, setForm] = useState(buildInitialForm(request));
  const [lookups, setLookups] = useState({ languages: [], helpTypes: [] });
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [emergencyNumberTouched, setEmergencyNumberTouched] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(request));
    setMessage({ type: "", text: "" });
    setEmergencyNumberTouched(false);
  }, [request]);

  useEffect(() => {
    if (!request) {
      return undefined;
    }

    let isMounted = true;

    async function loadLookups() {
      setLookupsLoading(true);

      try {
        const data = await getVolunteerManagementLookups();

        if (isMounted) {
          setLookups(data);
        }
      } catch (error) {
        console.error("Failed to load subscription form lookups:", error);
        if (isMounted) {
          setMessage({ type: "error", text: "שגיאה בטעינת שפות וסוגי עזרה" });
        }
      } finally {
        if (isMounted) {
          setLookupsLoading(false);
        }
      }
    }

    loadLookups();

    return () => {
      isMounted = false;
    };
  }, [request]);

  if (!request) {
    return null;
  }

  const participantDocId = request.participant?.id || request.participant_ref;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmergencyNumberChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    updateField("emergency_number", digitsOnly);
  };

  const emergencyNumberError = getEmergencyNumberError(form.emergency_number);
  const showEmergencyNumberError =
    emergencyNumberTouched && Boolean(emergencyNumberError);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setEmergencyNumberTouched(true);

    const participantValidationError = validateParticipantForm(form);
    const subscriptionValidationError = validateSubscriptionForm(form);
    const validationError =
      participantValidationError || subscriptionValidationError;

    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    if (!request.id) {
      console.error(
        "Missing communitySubscriptions document id for request:",
        request
      );
      setMessage({
        type: "error",
        text: "לא נמצא מזהה מסמך הצטרפות (communitySubscriptions)",
      });
      return;
    }

    if (!participantDocId) {
      setMessage({ type: "error", text: "לא נמצא משתתף מקושר לבקשה" });
      return;
    }

    setSaving(true);

    try {
      const { participantData, subscriptionData } = splitFormData(form);

      await completeCommunityJoinRegistration({
        subscriptionId: request.id,
        participantDocId,
        participantData,
        subscriptionData,
      });

      onSaved?.();
    } catch (error) {
      console.error("Failed to complete community join registration:", error);

      const errorMessage =
        error instanceof Error && error.message.includes("communitySubscriptions")
          ? "לא נמצא מסמך הצטרפות לעדכון. נסו לרענן את הרשימה."
          : "אירעה שגיאה בשמירת הרישום";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="community-join-modal" role="presentation">
      <button
        type="button"
        className="community-join-modal__backdrop"
        aria-label="סגירת טופס"
        onClick={onClose}
      />

      <div
        className="community-join-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-join-modal-title"
      >
        <header className="community-join-modal__header">
          <h2 id="community-join-modal-title">השלמת רישום לקהילה תומכת</h2>
          <button
            type="button"
            className="community-join-modal__close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </header>

        <form className="community-join-modal__form" onSubmit={handleSubmit}>
          <p className="community-join-modal__hint">
            השלימו את פרטי המשתתף ופרטי המנוי. שדות שכבר הוזנו בבקשה הראשונית
            מולאו אוטומטית.
          </p>

          <h3 className="community-join-modal__section-title">פרטי משתתף/ת</h3>

          <div className="community-join-modal__fields">
            <div className="community-join-modal__field">
              <label htmlFor="join-first-name">שם פרטי *</label>
              <input
                id="join-first-name"
                type="text"
                value={form.first_name}
                onChange={(event) =>
                  updateField("first_name", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="join-last-name">שם משפחה *</label>
              <input
                id="join-last-name"
                type="text"
                value={form.last_name}
                onChange={(event) =>
                  updateField("last_name", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="join-id-number">מספר תעודת זהות *</label>
              <input
                id="join-id-number"
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={form.id_number}
                onChange={(event) =>
                  updateField("id_number", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="join-phone">טלפון *</label>
              <input
                id="join-phone"
                type="tel"
                inputMode="tel"
                maxLength={10}
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="join-birth-date">תאריך לידה *</label>
              <input
                id="join-birth-date"
                type="date"
                value={form.birth_date}
                onChange={(event) =>
                  updateField("birth_date", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="join-gender">מין *</label>
              <select
                id="join-gender"
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
              >
                <option value="">בחר/י מין</option>
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="join-address">כתובת *</label>
              <input
                id="join-address"
                type="text"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="join-emergency-number">מספר חירום *</label>
              <input
                id="join-emergency-number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="05XXXXXXXX"
                className={
                  showEmergencyNumberError
                    ? "community-join-modal__input--invalid"
                    : ""
                }
                aria-invalid={showEmergencyNumberError}
                aria-describedby={
                  showEmergencyNumberError
                    ? "join-emergency-number-error"
                    : undefined
                }
                value={form.emergency_number}
                onChange={(event) =>
                  handleEmergencyNumberChange(event.target.value)
                }
                onBlur={() => setEmergencyNumberTouched(true)}
              />
              {showEmergencyNumberError && (
                <span
                  id="join-emergency-number-error"
                  className="community-join-modal__field-error"
                  role="alert"
                >
                  {emergencyNumberError}
                </span>
              )}
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="join-medical-notes">הערות רפואיות</label>
              <textarea
                id="join-medical-notes"
                value={form.medical_notes}
                onChange={(event) =>
                  updateField("medical_notes", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="join-mobility-limitations">מגבלות ניידות</label>
              <textarea
                id="join-mobility-limitations"
                value={form.mobility_limitations}
                onChange={(event) =>
                  updateField("mobility_limitations", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--checkbox">
              <label className="community-join-modal__checkbox-label">
                <input
                  type="checkbox"
                  checked={form.marketing_consent}
                  onChange={(event) =>
                    updateField("marketing_consent", event.target.checked)
                  }
                />
                <span>אישור לקבלת דיוור שיווקי</span>
              </label>
            </div>
          </div>

          <h3 className="community-join-modal__section-title">פרטי מנוי</h3>

          <div className="community-join-modal__fields">
            <CommunityStaffSubscriptionFormFields
              form={form}
              updateField={updateField}
              lookups={lookups}
              lookupsLoading={lookupsLoading}
              idPrefix="join"
            />
          </div>

          {message.text && (
            <p
              className={`community-join-modal__message community-join-modal__message--${message.type}`}
              role={message.type === "error" ? "alert" : "status"}
            >
              {message.text}
            </p>
          )}

          <div className="community-join-modal__actions">
            <button
              type="button"
              className="community-join-modal__btn community-join-modal__btn--secondary"
              onClick={onClose}
              disabled={saving}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="community-join-modal__btn community-join-modal__btn--primary"
              disabled={saving || lookupsLoading}
            >
              {saving ? "שומר..." : "שמירה והפעלת חברות"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteCommunityJoinModal;
