import { useEffect, useState } from "react";
import {
  getVolunteerManagementLookups,
  updateCommunityMemberParticipant,
  updateCommunityMemberSubscription,
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

function buildInitialForm(member) {
  const participant = member?.participant || {};

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
    ...buildSubscriptionFormValues(member),
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

function EditCommunityMemberModal({ member, onClose, onSaved }) {
  const [form, setForm] = useState(buildInitialForm(member));
  const [lookups, setLookups] = useState({ languages: [], helpTypes: [] });
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [emergencyNumberTouched, setEmergencyNumberTouched] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(member));
    setMessage({ type: "", text: "" });
    setEmergencyNumberTouched(false);
  }, [member]);

  useEffect(() => {
    if (!member) {
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
        console.error("Failed to load member form lookups:", error);
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
  }, [member]);

  if (!member) {
    return null;
  }

  const participantDocId = member.participantDocId || member.participant?.id;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

    if (!participantDocId) {
      setMessage({ type: "error", text: "לא נמצא מסמך משתתף לעדכון" });
      return;
    }

    if (!member.id) {
      setMessage({ type: "error", text: "לא נמצא מסמך מנוי לעדכון" });
      return;
    }

    setSaving(true);

    try {
      const { participantData, subscriptionData } = splitFormData(form);

      await Promise.all([
        updateCommunityMemberParticipant(participantDocId, participantData),
        updateCommunityMemberSubscription(member.id, subscriptionData),
      ]);

      onSaved();
    } catch (error) {
      console.error("Failed to update community member:", error);
      setMessage({ type: "error", text: "אירעה שגיאה בעדכון פרטי החבר" });
    } finally {
      setSaving(false);
    }
  };

  const emergencyNumberError =
    emergencyNumberTouched || message.type === "error"
      ? getEmergencyNumberError(form.emergency_number)
      : "";

  return (
    <div className="community-join-modal" role="presentation">
      <button
        type="button"
        className="community-join-modal__backdrop"
        onClick={onClose}
        aria-label="סגירה"
      />

      <div
        className="community-join-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-member-title"
      >
        <div className="community-join-modal__header">
          <h2 id="edit-member-title">עריכת פרטי חבר</h2>
          <button
            type="button"
            className="community-join-modal__close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <form className="community-join-modal__form" onSubmit={handleSubmit} noValidate>
          <p className="community-join-modal__hint">
            עדכון פרטים אישיים במסמך המשתתף ופרטי מנוי במסמך ההצטרפות.
          </p>

          <h3 className="community-join-modal__section-title">פרטי משתתף/ת</h3>

          <div className="community-join-modal__fields">
            <div className="community-join-modal__field">
              <label htmlFor="edit-member-first-name">שם פרטי *</label>
              <input
                id="edit-member-first-name"
                type="text"
                value={form.first_name}
                onChange={(event) => updateField("first_name", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="edit-member-last-name">שם משפחה *</label>
              <input
                id="edit-member-last-name"
                type="text"
                value={form.last_name}
                onChange={(event) => updateField("last_name", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="edit-member-id-number">תעודת זהות *</label>
              <input
                id="edit-member-id-number"
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={form.id_number}
                onChange={(event) => updateField("id_number", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="edit-member-phone">טלפון *</label>
              <input
                id="edit-member-phone"
                type="text"
                inputMode="tel"
                maxLength={10}
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="edit-member-birth-date">תאריך לידה *</label>
              <input
                id="edit-member-birth-date"
                type="date"
                value={form.birth_date}
                onChange={(event) => updateField("birth_date", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="edit-member-gender">מין *</label>
              <select
                id="edit-member-gender"
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
              <label htmlFor="edit-member-address">כתובת *</label>
              <input
                id="edit-member-address"
                type="text"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="edit-member-emergency-number">מספר חירום *</label>
              <input
                id="edit-member-emergency-number"
                type="text"
                inputMode="tel"
                maxLength={10}
                value={form.emergency_number}
                onChange={(event) =>
                  updateField("emergency_number", event.target.value)
                }
                onBlur={() => setEmergencyNumberTouched(true)}
                aria-invalid={Boolean(emergencyNumberError)}
              />
              {emergencyNumberError && (
                <span className="community-join-modal__field-error" role="alert">
                  {emergencyNumberError}
                </span>
              )}
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="edit-member-medical-notes">הערות רפואיות</label>
              <textarea
                id="edit-member-medical-notes"
                value={form.medical_notes}
                onChange={(event) =>
                  updateField("medical_notes", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="edit-member-mobility-limitations">
                מגבלות ניידות
              </label>
              <textarea
                id="edit-member-mobility-limitations"
                value={form.mobility_limitations}
                onChange={(event) =>
                  updateField("mobility_limitations", event.target.value)
                }
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label className="community-join-modal__checkbox">
                <input
                  type="checkbox"
                  checked={form.marketing_consent}
                  onChange={(event) =>
                    updateField("marketing_consent", event.target.checked)
                  }
                />
                הסכמה לדיוור שיווקי
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
              idPrefix="edit-member"
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
            <button type="button" onClick={onClose} disabled={saving}>
              ביטול
            </button>
            <button type="submit" disabled={saving || lookupsLoading}>
              {saving ? "שומר..." : "שמירת פרטים"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCommunityMemberModal;
