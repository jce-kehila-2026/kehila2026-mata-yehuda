import { useCallback, useEffect, useState } from "react";
import {
  approveHelpRequestMatch,
  getPendingHomeHelpRequests,
  getSuggestedVolunteersForRequest,
} from "../../services/communityStaff/communityStaffService";

function formatStringArray(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return "—";
  }

  const items = value.filter(Boolean);
  return items.length > 0 ? items.join(", ") : "—";
}

function formatRequestedHelpTypes(request) {
  const helpTypes = request.requestedHelpTypes ?? request.requestedServices;

  if (!Array.isArray(helpTypes) || helpTypes.length === 0) {
    return "—";
  }

  return helpTypes.join(", ");
}

function MatchModal({
  helpRequest,
  onClose,
  onMatchApproved,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState(null);
  const [approvingVolunteerId, setApprovingVolunteerId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSuggestions() {
      setLoadingSuggestions(true);
      setSuggestionsError(null);

      try {
        const suggestedVolunteers =
          await getSuggestedVolunteersForRequest(helpRequest);

        if (isMounted) {
          setSuggestions(suggestedVolunteers);
        }
      } catch (err) {
        console.error("Failed to load volunteer suggestions:", err);
        if (isMounted) {
          setSuggestionsError("שגיאה בטעינת מתנדבים מתאימים");
        }
      } finally {
        if (isMounted) {
          setLoadingSuggestions(false);
        }
      }
    }

    loadSuggestions();

    return () => {
      isMounted = false;
    };
  }, [helpRequest]);

  const handleApproveMatch = async (volunteer) => {
    const volunteerKey = volunteer.volunteerRef || volunteer.volunteerId;
    setApprovingVolunteerId(volunteerKey);

    try {
      await approveHelpRequestMatch(helpRequest, volunteer);
      onMatchApproved();
    } catch (err) {
      console.error("Failed to approve help request match:", err);
      alert("אירעה שגיאה בשמירת ההתאמה");
    } finally {
      setApprovingVolunteerId(null);
    }
  };

  return (
    <div
      className="community-help-requests__modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="community-help-requests__modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-match-title"
      >
        <div className="community-help-requests__modal-header">
          <h2 id="help-match-title">התאמת מתנדב לבקשת סיוע</h2>
          <button
            type="button"
            className="community-help-requests__modal-close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <div className="community-help-requests__request-summary">
          <p>
            <strong>מבקש/ת:</strong> {helpRequest.participantFullName}
          </p>
          <p>
            <strong>טלפון:</strong> {helpRequest.participantPhone}
          </p>
          <p>
            <strong>סוגי עזרה:</strong>{" "}
            {formatRequestedHelpTypes(helpRequest)}
          </p>
          <p>
            <strong>שפות:</strong> {helpRequest.languagesDisplay || "—"}
          </p>
          <p>
            <strong>תיאור:</strong> {helpRequest.description || "—"}
          </p>
        </div>

        <h3 className="community-help-requests__suggestions-title">
          מתנדבים מוצעים
        </h3>

        {loadingSuggestions && (
          <p className="community-help-requests__suggestions-loading">
            טוען מתנדבים מתאימים...
          </p>
        )}

        {suggestionsError && (
          <p className="community-help-requests__suggestions-error">
            {suggestionsError}
          </p>
        )}

        {!loadingSuggestions && !suggestionsError && suggestions.length === 0 && (
          <p className="community-help-requests__suggestions-empty">
            לא נמצאו מתנדבים מתאימים
          </p>
        )}

        {!loadingSuggestions && !suggestionsError && suggestions.length > 0 && (
          <div className="community-help-requests__suggestions-list">
            {suggestions.map((volunteer) => {
              const volunteerKey = volunteer.volunteerRef || volunteer.volunteerId;

              return (
              <div
                key={volunteerKey}
                className="community-help-requests__suggestion-row"
              >
                <div className="community-help-requests__suggestion-details">
                  <p>
                    <strong>שם:</strong> {volunteer.fullNameDisplay}
                  </p>
                  <p>
                    <strong>טלפון:</strong> {volunteer.phone}
                  </p>
                  <p>
                    <strong>ציון התאמה:</strong>{" "}
                    <span className="community-help-requests__match-score">
                      {volunteer.matchScore}
                    </span>
                  </p>
                  <p>
                    <strong>סוגי עזרה משותפים:</strong>{" "}
                    {formatStringArray(
                      volunteer.matchedHelpTypes ?? volunteer.matchingHelpTypes
                    )}
                  </p>
                  <p>
                    <strong>שפות משותפות:</strong>{" "}
                    {formatStringArray(
                      volunteer.matchedLanguages ?? volunteer.matchingLanguages
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  className="community-help-requests__approve-btn"
                  onClick={() => handleApproveMatch(volunteer)}
                  disabled={approvingVolunteerId === volunteerKey}
                >
                  {approvingVolunteerId === volunteerKey
                    ? "שומר..."
                    : "אישור התאמה"}
                </button>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CommunityHelpRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pendingRequests = await getPendingHomeHelpRequests();
      setRequests(pendingRequests);
    } catch (err) {
      console.error("Failed to load home help requests:", err);
      setError("שגיאה בטעינת בקשות הסיוע");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleMatchApproved = () => {
    setSelectedRequest(null);
    loadRequests();
  };

  if (loading) {
    return (
      <p className="community-help-requests__loading">טוען בקשות סיוע...</p>
    );
  }

  if (error) {
    return <p className="community-help-requests__error">{error}</p>;
  }

  return (
    <div className="community-help-requests">
      <div className="community-help-requests__top-row">
        <span className="community-help-requests__badge">
          בקשות ממתינות {requests.length}
        </span>
      </div>

      <div className="community-help-requests__card">
        {requests.length === 0 ? (
          <p className="community-help-requests__empty">
            אין בקשות סיוע ממתינות
          </p>
        ) : (
          <div className="community-help-requests__table-wrapper">
            <table className="community-help-requests__table">
              <thead>
                <tr>
                  <th>שם מבקש</th>
                  <th>תעודת זהות</th>
                  <th>טלפון</th>
                  <th>סוגי עזרה</th>
                  <th>שפות</th>
                  <th>תיאור</th>
                  <th>סטטוס</th>
                  <th>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="community-help-requests__row"
                  >
                    <td data-label="שם מבקש">
                      {request.participantFullName}
                    </td>
                    <td data-label="תעודת זהות">
                      {request.participantIdNumber}
                    </td>
                    <td data-label="טלפון">{request.participantPhone}</td>
                    <td data-label="סוגי עזרה">
                      {formatRequestedHelpTypes(request)}
                    </td>
                    <td data-label="שפות">
                      {request.languagesDisplay || "—"}
                    </td>
                    <td data-label="תיאור">{request.description || "—"}</td>
                    <td data-label="סטטוס">
                      <span className="community-help-requests__status">
                        {request.status || "—"}
                      </span>
                    </td>
                    <td data-label="פעולה">
                      <button
                        type="button"
                        className="community-help-requests__match-btn"
                        onClick={() => setSelectedRequest(request)}
                      >
                        התאמה
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRequest && (
        <MatchModal
          helpRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onMatchApproved={handleMatchApproved}
        />
      )}
    </div>
  );
}

export default CommunityHelpRequestsTable;
