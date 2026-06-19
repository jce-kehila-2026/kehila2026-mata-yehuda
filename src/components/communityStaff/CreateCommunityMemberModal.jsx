import { useEffect, useState } from "react";
import {
  createCommunityMemberByStaff,
  DUPLICATE_ID_NUMBER_ERROR,
  getVolunteerManagementLookups,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffSubscriptionFormFields, {
  validateSubscriptionForm,
} from "./CommunityStaffSubscriptionFormFields.jsx";
import {
  buildEmptyCommunityMemberForm,
  getEmergencyNumberError,
  PAYMENT_METHOD_OPTIONS,
  splitCommunityMemberFormData,
  validateCommunityMemberParticipantForm,
} from "./communityStaffFormUtils.js";

function CreateCommunityMemberModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(buildEmptyCommunityMemberForm);
  const [lookups, setLookups] = useState({ languages: [], helpTypes: [] });
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [emergencyNumberTouched, setEmergencyNumberTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setForm(buildEmptyCommunityMemberForm());
    setMessage({ type: "", text: "" });
    setEmergencyNumberTouched(false);

    let isMounted = true;

    async function loadLookups() {
      setLookupsLoading(true);

      try {
        const data = await getVolunteerManagementLookups();

        if (isMounted) {
          setLookups(data);
        }
      } catch (error) {
        console.error("Failed to load member creation lookups:", error);
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
  }, [open]);

  if (!open) {
    return null;
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmergencyNumberChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    updateField("emergency_number", digitsOnly);
  };

  const handleIdNumberChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 9);
    updateField("id_number", digitsOnly);
  };

  const handlePhoneChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    updateField("phone", digitsOnly);
  };

  const emergencyNumberError = getEmergencyNumberError(form.emergency_number);
  const showEmergencyNumberError =
    emergencyNumberTouched && Boolean(emergencyNumberError);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setEmergencyNumberTouched(true);

    const participantValidationError = validateCommunityMemberParticipantForm(form);
    const subscriptionValidationError = validateSubscriptionForm(form);
    const validationError =
      participantValidationError || subscriptionValidationError;

    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);

    try {
      const { participantData, subscriptionData } = splitCommunityMemberFormData(form);

      await createCommunityMemberByStaff({
        participantData,
        subscriptionData,
      });

      onSaved?.();
    } catch (error) {
      console.error("Failed to create community member:", error);

      if (
        error?.code === "duplicate-id-number" ||
        error?.message === DUPLICATE_ID_NUMBER_ERROR
      ) {
        setMessage({ type: "error", text: DUPLICATE_ID_NUMBER_ERROR });
        return;
      }

      setMessage({ type: "error", text: "אירעה שגיאה ביצירת חבר/ת הקהילה" });
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
        aria-labelledby="create-member-modal-title"
      >
        <header className="community-join-modal__header">
          <h2 id="create-member-modal-title">הוספת חבר/ת קהילה</h2>
          <button
            type="button"
            className="community-join-modal__close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </header>

        <form className="community-join-modal__form" onSubmit={handleSubmit} noValidate>
          <p className="community-join-modal__hint">
            מילוי פרטי משתתף/ת ופרטי מנוי ליצירת חברות פעילה בקהילה התומכת.
          </p>

          <h3 className="community-join-modal__section-title">פרטי משתתף/ת</h3>

          <div className="community-join-modal__fields">
            <div className="community-join-modal__field">
              <label htmlFor="create-member-first-name">שם פרטי *</label>
              <input
                id="create-member-first-name"
                type="text"
                value={form.first_name}
                onChange={(event) => updateField("first_name", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-member-last-name">שם משפחה *</label>
              <input
                id="create-member-last-name"
                type="text"
                value={form.last_name}
                onChange={(event) => updateField("last_name", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-member-id-number">מספר תעודת זהות *</label>
              <input
                id="create-member-id-number"
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={form.id_number}
                onChange={(event) => handleIdNumberChange(event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-member-phone">טלפון *</label>
              <input
                id="create-member-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="05XXXXXXXX"
                value={form.phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-member-birth-date">תאריך לידה *</label>
              <input
                id="create-member-birth-date"
                type="date"
                value={form.birth_date}
                onChange={(event) => updateField("birth_date", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-member-gender">מין *</label>
              <select
                id="create-member-gender"
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
              <label htmlFor="create-member-address">כתובת *</label>
              <input
                id="create-member-address"
                type="text"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-member-emergency-contact-name">
                שם איש קשר לחירום
              </label>
              <input
                id="create-member-emergency-contact-name"
                type="text"
                value={form.emergency_contact_name}
                onChange={(event) =>
                  updateField("emergency_contact_name", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-member-emergency-number">
                טלפון איש קשר לחירום *
              </label>
              <input
                id="create-member-emergency-number"
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
                value={form.emergency_number}
                onChange={(event) =>
                  handleEmergencyNumberChange(event.target.value)
                }
                onBlur={() => setEmergencyNumberTouched(true)}
              />
              {showEmergencyNumberError && (
                <span className="community-join-modal__field-error" role="alert">
                  {emergencyNumberError}
                </span>
              )}
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-member-payment-method">אמצעי תשלום</label>
              <select
                id="create-member-payment-method"
                value={form.payment_method}
                onChange={(event) =>
                  updateField("payment_method", event.target.value)
                }
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value || "empty"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="create-member-notes">הערות נוספות</label>
              <textarea
                id="create-member-notes"
                value={form.medical_notes}
                onChange={(event) => updateField("medical_notes", event.target.value)}
              />
            </div>
          </div>

          <h3 className="community-join-modal__section-title">פרטי מנוי</h3>

          <div className="community-join-modal__fields">
            <CommunityStaffSubscriptionFormFields
              form={form}
              updateField={updateField}
              lookups={lookups}
              lookupsLoading={lookupsLoading}
              idPrefix="create-member"
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
              {saving ? "שומר..." : "יצירת חבר/ת קהילה"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCommunityMemberModal;
