import { useEffect, useState } from "react";
import { updateVolunteerMatchNotes } from "../../services/communityStaff/communityStaffService";

function ActiveVolunteerMatchDetailsModal({ match, onClose, onSaved }) {
  const [notes, setNotes] = useState(match?.notes || "");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(match?.notes || "");
    setMessage({ type: "", text: "" });
  }, [match]);

  if (!match) {
    return null;
  }

  const handleSaveNotes = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    try {
      await updateVolunteerMatchNotes(match.id, notes);
      setMessage({ type: "success", text: "ההערות נשמרו בהצלחה" });
      onSaved();
    } catch (error) {
      console.error("Failed to update match notes:", error);
      setMessage({ type: "error", text: "אירעה שגיאה בשמירת ההערות" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="community-active-matches__modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="community-active-matches__modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-match-details-title"
      >
        <div className="community-active-matches__modal-header">
          <h2 id="active-match-details-title">פרטי התאמה</h2>
          <button
            type="button"
            className="community-active-matches__modal-close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <div className="community-active-matches__details-section">
          <h3>משתתף/ת</h3>
          <dl className="community-active-matches__details-grid">
            <div>
              <dt>שם מלא</dt>
              <dd>{match.participantFullName}</dd>
            </div>
            <div>
              <dt>טלפון</dt>
              <dd>{match.participantPhone}</dd>
            </div>
            <div>
              <dt>תעודת זהות</dt>
              <dd>{match.participantIdNumber}</dd>
            </div>
            <div>
              <dt>כתובת</dt>
              <dd>{match.participant?.address || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="community-active-matches__details-section">
          <h3>מתנדב/ת</h3>
          <dl className="community-active-matches__details-grid">
            <div>
              <dt>שם מלא</dt>
              <dd>{match.volunteerFullName}</dd>
            </div>
            <div>
              <dt>טלפון</dt>
              <dd>{match.volunteerPhone}</dd>
            </div>
            <div>
              <dt>סטטוס פעילות</dt>
              <dd>{match.volunteerIsActiveDisplay}</dd>
            </div>
            <div>
              <dt>כתובת</dt>
              <dd>{match.volunteer?.address || "—"}</dd>
            </div>
            {match.volunteer?.email?.trim() ? (
              <div>
                <dt>אימייל</dt>
                <dd>{match.volunteer.email}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="community-active-matches__details-section">
          <h3>בקשת סיוע</h3>
          <dl className="community-active-matches__details-grid">
            <div>
              <dt>תאריך יצירה</dt>
              <dd>{match.helpRequestCreatedAtDisplay}</dd>
            </div>
            <div>
              <dt>סטטוס בקשה</dt>
              <dd>{match.helpRequestStatus}</dd>
            </div>
            <div className="community-active-matches__details-full">
              <dt>תיאור</dt>
              <dd>{match.helpRequestDescription}</dd>
            </div>
            <div>
              <dt>שפות</dt>
              <dd>{match.helpRequestLanguagesDisplay}</dd>
            </div>
            <div>
              <dt>סוגי עזרה</dt>
              <dd>{match.helpRequestHelpTypesDisplay}</dd>
            </div>
          </dl>
        </div>

        <div className="community-active-matches__details-section">
          <h3>פרטי התאמה</h3>
          <dl className="community-active-matches__details-grid">
            <div>
              <dt>ציון התאמה</dt>
              <dd>{match.matchScore}</dd>
            </div>
            <div>
              <dt>תאריך התאמה</dt>
              <dd>{match.matchedAtDisplay}</dd>
            </div>
            <div>
              <dt>סטטוס</dt>
              <dd>{match.status}</dd>
            </div>
            <div>
              <dt>שפות משותפות</dt>
              <dd>{match.matchedLanguagesDisplay}</dd>
            </div>
            <div>
              <dt>סוגי עזרה משותפים</dt>
              <dd>{match.matchedHelpTypesDisplay}</dd>
            </div>
          </dl>
        </div>

        <form
          className="community-active-matches__notes-form"
          onSubmit={handleSaveNotes}
        >
          <label htmlFor="active-match-notes">הערות</label>
          <textarea
            id="active-match-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
          />

          {message.text && (
            <p
              className={`community-active-matches__message community-active-matches__message--${message.type}`}
              role={message.type === "error" ? "alert" : "status"}
            >
              {message.text}
            </p>
          )}

          <div className="community-active-matches__modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              סגירה
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "שומר..." : "שמירת הערות"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActiveVolunteerMatchDetailsModal;
