import { useEffect, useState } from "react";
import {
  getVolunteerManagementLookups,
  updateVolunteerDetails,
} from "../../services/communityStaff/communityStaffService";

function buildInitialForm(volunteer) {
  return {
    first_name: volunteer?.first_name || volunteer?.firstName || "",
    last_name: volunteer?.last_name || volunteer?.lastName || "",
    phone: volunteer?.phone || "",
    email: volunteer?.email || "",
    gender: volunteer?.gender || "",
    address: volunteer?.address || "",
    notes: volunteer?.notes || "",
    languages: Array.isArray(volunteer?.languages) ? [...volunteer.languages] : [],
    help_types: Array.isArray(volunteer?.help_types) ? [...volunteer.help_types] : [],
  };
}

function validateForm(form) {
  if (!form.first_name.trim()) {
    return "נא למלא שם פרטי";
  }

  if (!form.last_name.trim()) {
    return "נא למלא שם משפחה";
  }

  if (!form.phone.trim()) {
    return "נא למלא מספר טלפון";
  }

  if (form.languages.length === 0) {
    return "נא לבחור לפחות שפה אחת";
  }

  if (form.help_types.length === 0) {
    return "נא לבחור לפחות סוג עזרה אחד";
  }

  return "";
}

function toggleArrayValue(values, value) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

function EditVolunteerModal({ volunteer, onClose, onSaved }) {
  const [form, setForm] = useState(buildInitialForm(volunteer));
  const [lookups, setLookups] = useState({ languages: [], helpTypes: [] });
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(volunteer));
    setMessage({ type: "", text: "" });
  }, [volunteer]);

  useEffect(() => {
    if (!volunteer) {
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
        console.error("Failed to load volunteer form lookups:", error);
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
  }, [volunteer]);

  if (!volunteer) {
    return null;
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const validationError = validateForm(form);

    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);

    try {
      await updateVolunteerDetails(volunteer.id, form);
      onSaved();
    } catch (error) {
      console.error("Failed to update volunteer:", error);
      setMessage({ type: "error", text: "אירעה שגיאה בעדכון פרטי המתנדב" });
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
        aria-labelledby="edit-volunteer-title"
      >
        <div className="community-join-modal__header">
          <h2 id="edit-volunteer-title">עריכת פרטי מתנדב</h2>
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
            עדכון פרטי המתנדב במסמך הקיים בלבד.
          </p>

          <div className="community-join-modal__fields">
            <div className="community-join-modal__field">
              <label htmlFor="edit-volunteer-first-name">שם פרטי *</label>
              <input
                id="edit-volunteer-first-name"
                type="text"
                value={form.first_name}
                onChange={(event) => updateField("first_name", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="edit-volunteer-last-name">שם משפחה *</label>
              <input
                id="edit-volunteer-last-name"
                type="text"
                value={form.last_name}
                onChange={(event) => updateField("last_name", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="edit-volunteer-phone">טלפון *</label>
              <input
                id="edit-volunteer-phone"
                type="text"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </div>

            {volunteer?.email?.trim() ? (
              <div className="community-join-modal__field">
                <label htmlFor="edit-volunteer-email">אימייל</label>
                <input
                  id="edit-volunteer-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>
            ) : null}

            <div className="community-join-modal__field">
              <label htmlFor="edit-volunteer-gender">מין</label>
              <select
                id="edit-volunteer-gender"
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
              <label htmlFor="edit-volunteer-address">כתובת מגורים</label>
              <input
                id="edit-volunteer-address"
                type="text"
                autoComplete="street-address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label>שפות *</label>
              {lookupsLoading ? (
                <p className="community-volunteers-mgmt__lookup-loading">טוען שפות...</p>
              ) : (
                <div className="community-volunteers-mgmt__options">
                  {lookups.languages.map((language) => (
                    <label key={language.id} className="community-volunteers-mgmt__option">
                      <input
                        type="checkbox"
                        checked={form.languages.includes(language.id)}
                        onChange={() =>
                          updateField(
                            "languages",
                            toggleArrayValue(form.languages, language.id)
                          )
                        }
                      />
                      {language.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label>סוגי עזרה *</label>
              {lookupsLoading ? (
                <p className="community-volunteers-mgmt__lookup-loading">טוען סוגי עזרה...</p>
              ) : (
                <div className="community-volunteers-mgmt__options">
                  {lookups.helpTypes.map((helpType) => (
                    <label key={helpType.id} className="community-volunteers-mgmt__option">
                      <input
                        type="checkbox"
                        checked={form.help_types.includes(helpType.id)}
                        onChange={() =>
                          updateField(
                            "help_types",
                            toggleArrayValue(form.help_types, helpType.id)
                          )
                        }
                      />
                      {helpType.help_name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="community-join-modal__field community-join-modal__field--full">
              <label htmlFor="edit-volunteer-notes">הערות</label>
              <textarea
                id="edit-volunteer-notes"
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

export default EditVolunteerModal;
