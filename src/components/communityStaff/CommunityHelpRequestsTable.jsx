import { useCallback, useEffect, useState } from "react";
import {
  approveHelpRequestMatch,
  getPendingHomeHelpRequests,
  getSuggestedVolunteersForRequest,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "./CommunityStaffMessage";
import { CommunityStaffCompactCard } from "./CommunityStaffListUi.jsx";
import CommunityHelpRequestDetailsModal from "./CommunityHelpRequestDetailsModal.jsx";

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
  const { message, showError, clearMessage } = useCommunityStaffMessage();

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
      showError("אירעה שגיאה בשמירת ההתאמה");
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

        <CommunityStaffMessage message={message} onDismiss={clearMessage} />

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
  const [detailsRequest, setDetailsRequest] = useState(null);

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
    setDetailsRequest(null);
    loadRequests();
  };

  const handleOpenMatch = (request) => {
    setDetailsRequest(null);
    setSelectedRequest(request);
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
          <ul className="community-staff-compact-list">
            {requests.map((request) => (
              <CommunityStaffCompactCard
                key={request.id}
                name={request.participantFullName}
                phone={request.participantPhone}
                status={
                  <span className="community-help-requests__status">
                    {request.status || "—"}
                  </span>
                }
                primaryLabel="התאמה"
                onPrimaryClick={() => handleOpenMatch(request)}
                onViewDetails={() => setDetailsRequest(request)}
              />
            ))}
          </ul>
        )}
      </div>

      <CommunityHelpRequestDetailsModal
        request={detailsRequest}
        onClose={() => setDetailsRequest(null)}
        onMatch={handleOpenMatch}
      />

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
