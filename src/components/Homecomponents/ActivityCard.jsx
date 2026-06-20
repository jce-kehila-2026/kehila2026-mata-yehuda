import { useNavigate } from "react-router-dom";
import { toActivityDate } from "../../utils/staffManegmentUtils/dateUtils";

function isActivityExpired(activity, now = new Date()) {
  const startDate = toActivityDate(activity?.start_date);

  if (!startDate) {
    return false;
  }

  return startDate.getTime() < now.getTime();
}

function isActivityFull(activity) {
  const maxParticipants = Number(activity?.max_participants ?? 0);
  const currentParticipants = Number(activity?.current_participants ?? 0);

  if (!Number.isFinite(maxParticipants) || maxParticipants <= 0) {
    return false;
  }

  return (
    Number.isFinite(currentParticipants) &&
    currentParticipants >= maxParticipants
  );
}

function ActivityCard({ activity, programId = "" }) {
  const navigate = useNavigate();

  const resolvedProgramId =
    activity?.program_id || activity?.programId || programId || "";
  const isClosed = isActivityExpired(activity) || isActivityFull(activity);

  const goToPayment = () => {
    if (isClosed) {
      return;
    }

    const params = new URLSearchParams({ activityId: activity.id });
    if (resolvedProgramId) {
      params.set("programId", resolvedProgramId);
    }
    navigate(`/pay?${params.toString()}`);
  };

  if (!activity) return null;

  const startDate = toActivityDate(activity.start_date);
  const endDate = toActivityDate(activity.end_date);

  return (
    <div className="activity-card">
      {activity.image_url && (
        <img src={activity.image_url} alt={activity.name} />
      )}

      <div className="activity-info">
        <div className={isClosed ? "status closed" : "status open"}>
          {isClosed ? "סגור" : "פתוח"}
        </div>

        <h2>{activity.name}</h2>
        
        <p>{activity.description}</p>

        <div className="activity-meta">

          <div className="meta-item">
            <span>📅</span>
            <strong>
              {startDate?.toLocaleDateString("he-IL")}
            </strong>
          </div>

          <div className="meta-item">
            <span>🕒</span>
            <strong>
              {startDate?.toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" - "}
              {endDate?.toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
          </div>

          <div className="meta-item">
            <span>₪</span>
            <strong>{activity.price}</strong>
          </div>

        </div>
        <div className="activity-divider"></div>
        <button
          type="button"
          onClick={goToPayment}
          disabled={isClosed}
        >
          {isClosed ? "סגור להרשמה" : "השתתף"}
        </button>
      </div>
    </div>
  );
}

export default ActivityCard;