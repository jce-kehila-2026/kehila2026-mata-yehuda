import { useEffect, useState } from "react";
import {
  createLanguage,
  updateLanguage,
} from "../../services/communityStaff/communitySettingsService";
import { nameContainsNumber } from "../../utils/nameValidation";

function LanguageFormModal({ open, language, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(language?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(language?.name || "");
    setError("");
  }, [open, language]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("שם השפה הוא שדה חובה");
      return;
    }

    if (nameContainsNumber(trimmedName)) {
      setError("שם השפה אינו יכול להכיל מספרים");
      return;
    }

    setSaving(true);

    try {
      if (isEditing) {
        await updateLanguage(language.id, { name: trimmedName });
      } else {
        await createLanguage({ name: trimmedName });
      }

      onSaved?.();
    } catch (submitError) {
      console.error("Failed to save language:", submitError);
      setError("אירעה שגיאה בשמירת השפה. נסה שוב.");
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
        aria-labelledby="language-form-modal-title"
      >
        <div className="community-join-modal__header">
          <h2 id="language-form-modal-title">
            {isEditing ? "עריכת שפה" : "הוספת שפה"}
          </h2>
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
          <div className="community-join-modal__fields">
            <div className="community-join-modal__field">
              <label htmlFor="language-form-name">שם השפה *</label>
              <input
                id="language-form-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={saving}
                autoFocus
              />
            </div>
          </div>

          {error ? (
            <p
              className="community-join-modal__message community-join-modal__message--error"
              role="alert"
            >
              {error}
            </p>
          ) : null}

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
              disabled={saving}
            >
              {saving ? "שומר..." : isEditing ? "שמירה" : "הוספה"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LanguageFormModal;
