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

    if (!/^0\d{8,9}$/.test(phone)) {
      setMessage("מספר הטלפון חייב להתחיל ב-0 ולהכיל 9 או 10 ספרות");
      return;
    }

    try {
      const result = await checkCommunityMembership(participantId, phone);

      if (!result.exists) {
        setMessage(result.message);
        return;
      }

      onVerified({
        participantDocId: result.participantDocId,
        subscriptionDocId: result.subscriptionDocId,
        subscriptionData: result.subscriptionData,
      });
    } catch (error) {
      console.error("Error checking membership:", error);
      setMessage("אירעה שגיאה בבדיקת החברות");
    }
  };

  return (
    <form
      className="community-join-staff-form community-join-form"
      onSubmit={handleCheck}
    >
      <div className="community-join-staff-card">
        <section className="form-section">
          <div className="community-join-staff-section__head">
            <h2>בדיקת חברות בקהילה תומכת</h2>
            <p className="form-hint">
              כדי להגיש בקשת שירות נוסף, יש להזין תעודת זהות ומספר טלפון.
            </p>
          </div>

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

          <div className="community-join-staff-submit form-submit">
            <button type="submit">בדיקה</button>
          </div>
        </section>
      </div>
    </form>
  );
}

export default CommunityMembershipCheck;
