import { useState } from "react";
import { checkCommunityMembership } from "../../services/supportive community/supportiveCommunityService";

function CommunityMembershipCheck({ onVerified }) {
  const [participantId, setParticipantId] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleCheck = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!participantId.trim() || !phone.trim()) {
      setMessage("נא למלא תעודת זהות ומספר טלפון");
      return;
    }

    if (!/^\d{9}$/.test(participantId)) {
      setMessage("מספר תעודת זהות חייב להיות בן 9 ספרות");
      return;
    }

    if (!/^05\d{8}$/.test(phone)) {
      setMessage("מספר טלפון חייב להיות תקין");
      return;
    }

    try {
      const result = await checkCommunityMembership(participantId, phone);

      if (!result.exists) {
        setMessage(result.message);
        return;
      }

      onVerified(result.participantDocId);
    } catch (error) {
      console.error("Error checking membership:", error);
      setMessage("אירעה שגיאה בבדיקת החברות");
    }
  };

  return (
    <form className="community-join-form" onSubmit={handleCheck}>
      <section className="form-section">
        <h2>בדיקת חברות בקהילה תומכת</h2>
        <p className="form-hint">
          כדי להגיש בקשת שירות נוסף, יש להזין תעודת זהות ומספר טלפון.
        </p>

        <div className="form-fields">
          <div className="form-field">
            <label>תעודת זהות</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={9}
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>מספר טלפון</label>
            <input
              type="tel"
              inputMode="tel"
              maxLength={10}
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {message && <p className="form-error">{message}</p>}

        <div className="form-submit">
          <button type="submit">בדיקה</button>
        </div>
      </section>
    </form>
  );
}

export default CommunityMembershipCheck;
