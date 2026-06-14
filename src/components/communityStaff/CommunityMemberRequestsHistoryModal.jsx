import { useEffect, useState } from "react";
import { getCommunityMemberHomeHelpRequests } from "../../services/communityStaff/communityStaffService";

function CommunityMemberRequestsHistoryModal({ member, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!member) {
      return undefined;
    }

    let isMounted = true;

    async function loadHistory() {
      setLoading(true);
      setError(null);

      try {
        const participantDocId = member.participantDocId || member.participant?.id;
        const history = await getCommunityMemberHomeHelpRequests(participantDocId);

        if (isMounted) {
          setRequests(history);
        }
      } catch (err) {
        console.error("Failed to load member request history:", err);
        if (isMounted) {
          setError("שגיאה בטעינת היסטוריית הבקשות");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [member]);

  if (!member) {
    return null;
  }

  return (
    <div
      className="community-members__modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="community-members__modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-history-title"
      >
        <div className="community-members__modal-header">
          <h2 id="member-history-title">היסטוריית בקשות סיוע</h2>
          <button
            type="button"
            className="community-members__modal-close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <div className="community-members__modal-summary">
          <p>
            <strong>חבר/ה:</strong> {member.fullNameDisplay}
          </p>
          <p>
            <strong>תעודת זהות:</strong> {member.idNumberDisplay}
          </p>
        </div>

        {loading && (
          <p className="community-members__history-loading">טוען היסטוריה...</p>
        )}

        {error && <p className="community-members__history-error">{error}</p>}

        {!loading && !error && requests.length === 0 && (
          <p className="community-members__history-empty">אין בקשות סיוע להצגה</p>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="community-members__history-table-wrapper">
            <table className="community-members__history-table">
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>סוגי עזרה</th>
                  <th>שפות</th>
                  <th>תיאור</th>
                  <th>סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td data-label="תאריך">{request.createdAtDisplay}</td>
                    <td data-label="סוגי עזרה">
                      {request.requestedHelpTypesDisplay}
                    </td>
                    <td data-label="שפות">{request.languagesDisplay}</td>
                    <td data-label="תיאור">{request.description}</td>
                    <td data-label="סטטוס">
                      <span className="community-members__history-status">
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityMemberRequestsHistoryModal;
