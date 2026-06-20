import { useEffect, useState } from "react";
import {
  createHelpType,
  updateHelpType,
} from "../../services/communityStaff/communitySettingsService";

function HelpTypeFormModal({ open, helpType, onClose, onSaved }) {
  const [helpName, setHelpName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(helpType?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setHelpName(helpType?.help_name || "");
    setDescription(helpType?.description || "");
    setError("");
  }, [open, helpType]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedName = helpName.trim();

    if (!trimmedName) {
      setError("שם סוג העזרה הוא שדה חובה");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        help_name: trimmedName,
        description: description.trim(),
      };

      if (isEditing) {
        await updateHelpType(helpType.id, payload);
      } else {
        await createHelpType(payload);
      }

      onSaved?.();
    } catch (submitError) {
      console.error("Failed to save help type:", submitError);
      setError("אירעה שגיאה בשמירת סוג העזרה. נסה שוב.");
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
        aria-labelledby="help-type-form-modal-title"
      >
        <div className="community-join-modal__header">
          <h2 id="help-type-form-modal-title">
            {isEditing ? "עריכת סוג עזרה" : "הוספת סוג עזרה"}
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
              <label htmlFor="help-type-form-name">שם סוג העזרה *</label>
              <input
                id="help-type-form-name"
                type="text"
                value={helpName}
                onChange={(event) => setHelpName(event.target.value)}
                disabled={saving}
                autoFocus
              />
            </div>

            <div className="community-join-modal__field">
              <label htmlFor="help-type-form-description">תיאור</label>
              <textarea
                id="help-type-form-description"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={saving}
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

export default HelpTypeFormModal;
