import { useCallback, useEffect, useState } from "react";
import {
  approveVolunteer,
  getPendingVolunteerRequests,
} from "../../services/communityStaff/communityStaffService";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "./CommunityStaffMessage";
import { CommunityStaffCompactCard } from "./CommunityStaffListUi.jsx";
import VolunteerRequestDetailsModal from "./VolunteerRequestDetailsModal.jsx";

function VolunteerRequestsTable() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const { message, showError, clearMessage } = useCommunityStaffMessage();

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
      showError("אירעה שגיאה באישור המתנדב");
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

      <CommunityStaffMessage message={message} onDismiss={clearMessage} />

      <div className="community-volunteer-requests__card">
        {volunteers.length === 0 ? (
          <p className="community-volunteer-requests__empty">
            אין בקשות התנדבות ממתינות
          </p>
        ) : (
          <ul className="community-staff-compact-list">
            {volunteers.map((volunteer) => (
              <CommunityStaffCompactCard
                key={volunteer.id}
                name={volunteer.fullNameDisplay}
                phone={volunteer.phone || "—"}
                status={
                  <span className="community-volunteer-requests__status">
                    {volunteer.status || "—"}
                  </span>
                }
                primaryLabel="אישור מתנדב"
                onPrimaryClick={() => setSelectedVolunteer(volunteer)}
                onViewDetails={() => setSelectedVolunteer(volunteer)}
                primaryDisabled={isApproving}
              />
            ))}
          </ul>
        )}
      </div>

      <VolunteerRequestDetailsModal
        volunteer={selectedVolunteer}
        onClose={() => setSelectedVolunteer(null)}
        onApprove={handleApprove}
        isApproving={isApproving}
      />
    </div>
  );
}

export default VolunteerRequestsTable;
