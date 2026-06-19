import { useEffect, useState } from "react";
import {
  createVolunteerByStaff,
  DUPLICATE_ID_NUMBER_ERROR,
  getVolunteerManagementLookups,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffCheckboxGrid from "./CommunityStaffCheckboxGrid.jsx";
import {
  buildEmptyVolunteerForm,
  toggleArrayValue,
  validateCreateVolunteerForm,
} from "./communityStaffFormUtils.js";

function CreateVolunteerModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(buildEmptyVolunteerForm);
  const [lookups, setLookups] = useState({ languages: [], helpTypes: [] });
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setForm(buildEmptyVolunteerForm());
    setMessage({ type: "", text: "" });

    let isMounted = true;

    async function loadLookups() {
      setLookupsLoading(true);

      try {
        const data = await getVolunteerManagementLookups();

        if (isMounted) {
          setLookups(data);
        }
      } catch (error) {
        console.error("Failed to load volunteer creation lookups:", error);
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

  const handleIdNumberChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 9);
    updateField("id_number", digitsOnly);
  };

  const handlePhoneChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    updateField("phone", digitsOnly);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const validationError = validateCreateVolunteerForm(form);

    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);

    try {
      await createVolunteerByStaff(form.id_number, {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        gender: form.gender,
        address: form.address,
        languages: form.languages,
        help_types: form.help_types,
        about: form.about,
        notes: form.notes,
      });

      onSaved?.();
    } catch (error) {
      console.error("Failed to create volunteer:", error);

      if (
        error?.code === "duplicate-id-number" ||
        error?.message === DUPLICATE_ID_NUMBER_ERROR
      ) {
        setMessage({ type: "error", text: DUPLICATE_ID_NUMBER_ERROR });
        return;
      }

      setMessage({ type: "error", text: "אירעה שגיאה ביצירת המתנדב/ה" });
    } finally {
      setSaving(false);
    }
  };

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
        aria-labelledby="create-volunteer-modal-title"
      >
        <div className="community-join-modal__header">
          <h2 id="create-volunteer-modal-title">הוספת מתנדב/ה</h2>
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
            יצירת מתנדב/ה פעיל/ה ישירות על ידי צוות הקהילה.
          </p>

          <div className="community-join-modal__fields">
            <div className="community-join-modal__field">
              <label htmlFor="create-volunteer-id-number">מספר תעודת זהות *</label>
              <input
                id="create-volunteer-id-number"
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={form.id_number}
                onChange={(event) => handleIdNumberChange(event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-volunteer-phone">טלפון *</label>
              <input
                id="create-volunteer-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="05XXXXXXXX"
                value={form.phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-volunteer-first-name">שם פרטי *</label>
              <input
                id="create-volunteer-first-name"
                type="text"
                value={form.first_name}
                onChange={(event) => updateField("first_name", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-volunteer-last-name">שם משפחה *</label>
              <input
                id="create-volunteer-last-name"
                type="text"
                value={form.last_name}
                onChange={(event) => updateField("last_name", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="create-volunteer-gender">מין</label>
              <select
                id="create-volunteer-gender"
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
              <label htmlFor="create-volunteer-address">כתובת</label>
              <input
                id="create-volunteer-address"
                type="text"
                autoComplete="street-address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label>שפות *</label>
              <CommunityStaffCheckboxGrid
                items={lookups.languages}
                selectedValues={form.languages}
                onToggle={(id) =>
                  updateField("languages", toggleArrayValue(form.languages, id))
                }
                getItemId={(language) => language.id}
                getItemLabel={(language) => language.name}
                variant="languages"
                loading={lookupsLoading}
                loadingText="טוען שפות..."
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label>סוגי עזרה *</label>
              <CommunityStaffCheckboxGrid
                items={lookups.helpTypes}
                selectedValues={form.help_types}
                onToggle={(id) =>
                  updateField(
                    "help_types",
                    toggleArrayValue(form.help_types, id)
                  )
                }
                getItemId={(helpType) => helpType.id}
                getItemLabel={(helpType) => helpType.help_name}
                variant="help-types"
                loading={lookupsLoading}
                loadingText="טוען סוגי עזרה..."
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="create-volunteer-about">זמינות *</label>
              <textarea
                id="create-volunteer-about"
                value={form.about}
                onChange={(event) => updateField("about", event.target.value)}
                placeholder="לדוגמה: ימים ושעות בהן ניתן להתנדב"
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="create-volunteer-notes">הערות נוספות</label>
              <textarea
                id="create-volunteer-notes"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </div>
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
              {saving ? "שומר..." : "יצירת מתנדב/ה"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateVolunteerModal;
