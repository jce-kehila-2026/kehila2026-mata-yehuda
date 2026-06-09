import { useCallback, useEffect, useState } from "react";
import {
  approveVolunteer,
  getPendingVolunteerRequests,
} from "../../services/communityStaffService";

function formatList(value) {
  if (!value) return "—";
  if (Array.isArray(value)) {
    const items = value.filter(Boolean);
    return items.length > 0 ? items.join(", ") : "—";
  }
  return String(value);
}

function formatGender(gender) {
  if (gender === "male") return "זכר";
  if (gender === "female") return "נקבה";
  if (gender === "other") return "אחר";
  return gender || "—";
}

function VolunteerDetailsModal({ volunteer, onClose, onApprove, isApproving }) {
  const servicesDisplay = formatList(volunteer.services);
  const servicesText =
    volunteer.otherService && servicesDisplay !== "—"
      ? `${servicesDisplay}, ${volunteer.otherService}`
      : volunteer.otherService || servicesDisplay;

  return (
    <div
      className="community-volunteer-requests__modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="community-volunteer-requests__modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="volunteer-details-title"
      >
        <div className="community-volunteer-requests__modal-header">
          <h2 id="volunteer-details-title">פרטי מתנדב</h2>
          <button
            type="button"
            className="community-volunteer-requests__modal-close"
            onClick={onClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <dl className="community-volunteer-requests__details-grid">
          <div>
            <dt>שם מלא</dt>
            <dd>{volunteer.fullNameDisplay}</dd>
          </div>
          <div>
            <dt>תעודת זהות</dt>
            <dd>{volunteer.volunteerId || volunteer.id || "—"}</dd>
          </div>
          <div>
            <dt>טלפון</dt>
            <dd>{volunteer.phone || "—"}</dd>
          </div>
          <div>
            <dt>מין</dt>
            <dd>{formatGender(volunteer.gender)}</dd>
          </div>
          <div>
            <dt>תאריך לידה</dt>
            <dd>{volunteer.birthDate || "—"}</dd>
          </div>
          <div>
            <dt>כתובת</dt>
            <dd>{volunteer.address || "—"}</dd>
          </div>
          <div>
            <dt>שירותים</dt>
            <dd>{servicesText}</dd>
          </div>
          <div>
            <dt>שפות</dt>
            <dd>{volunteer.languagesDisplay || "—"}</dd>
          </div>
          <div className="community-volunteer-requests__details-full">
            <dt>אודות</dt>
            <dd>{volunteer.about || "—"}</dd>
          </div>
          <div className="community-volunteer-requests__details-full">
            <dt>הערות</dt>
            <dd>{volunteer.notes || "—"}</dd>
          </div>
        </dl>

        <div className="community-volunteer-requests__modal-actions">
          <button
            type="button"
            className="community-volunteer-requests__approve-btn"
            onClick={() => onApprove(volunteer.id)}
            disabled={isApproving}
          >
            {isApproving ? "שומר..." : "אישור / שמירת מתנדב"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VolunteerRequestsTable() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  const loadVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pendingVolunteers = await getPendingVolunteerRequests();
      setVolunteers(pendingVolunteers);
    } catch (err) {
      console.error("Failed to load volunteer requests:", err);
      setError("שגיאה בטעינת בקשות ההתנדבות");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers]);

  const handleApprove = async (volunteerId) => {
    setIsApproving(true);

    try {
      await approveVolunteer(volunteerId);
      setSelectedVolunteer(null);
      await loadVolunteers();
    } catch (err) {
      console.error("Failed to approve volunteer:", err);
      alert("אירעה שגיאה באישור המתנדב");
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <p className="community-volunteer-requests__loading">
        טוען בקשות התנדבות...
      </p>
    );
  }

  if (error) {
    return <p className="community-volunteer-requests__error">{error}</p>;
  }

  return (
    <div className="community-volunteer-requests">
      <div className="community-volunteer-requests__top-row">
        <span className="community-volunteer-requests__badge">
          בקשות ממתינות {volunteers.length}
        </span>
      </div>

      <div className="community-volunteer-requests__card">
        {volunteers.length === 0 ? (
          <p className="community-volunteer-requests__empty">
            אין בקשות התנדבות ממתינות
          </p>
        ) : (
          <div className="community-volunteer-requests__table-wrapper">
            <table className="community-volunteer-requests__table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>תעודת זהות</th>
                  <th>טלפון</th>
                  <th>סטטוס</th>
                  <th>פעולה</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((volunteer) => (
                  <tr
                    key={volunteer.id}
                    className="community-volunteer-requests__row"
                  >
                    <td data-label="שם">{volunteer.fullNameDisplay}</td>
                    <td data-label="תעודת זהות">
                      {volunteer.volunteerId || volunteer.id || "—"}
                    </td>
                    <td data-label="טלפון">{volunteer.phone || "—"}</td>
                    <td data-label="סטטוס">
                      <span className="community-volunteer-requests__status">
                        {volunteer.status || "—"}
                      </span>
                    </td>
                    <td data-label="פעולה">
                      <button
                        type="button"
                        className="community-volunteer-requests__view-btn"
                        onClick={() => setSelectedVolunteer(volunteer)}
                      >
                        הצגת פרטי מתנדב
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedVolunteer && (
        <VolunteerDetailsModal
          volunteer={selectedVolunteer}
          onClose={() => setSelectedVolunteer(null)}
          onApprove={handleApprove}
          isApproving={isApproving}
        />
      )}
    </div>
  );
}

export default VolunteerRequestsTable;
