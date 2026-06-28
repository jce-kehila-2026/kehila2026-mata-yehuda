import { useNavigate } from "react-router-dom";
import { formatActivityPrice } from "../../services/Payment/formatPrice";
import { isFreeActivityData } from "../../utils/HomeUtils/activityPricing";
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
    if (isFreeActivityData(activity)) {
      params.set("free", "1");
    }
    navigate(`/pay?${params.toString()}`);
  };

  if (!activity) return null;

  const startDate = toActivityDate(activity.start_date);
  const endDate = toActivityDate(activity.end_date);
  const dateLabel = startDate
    ? startDate.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const timeLabel = startDate
    ? `${startDate.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      })}${
        endDate
          ? ` - ${endDate.toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : ""
      }`
    : "";

  return (
    <article className="activity-card">
      <div className="activity-card__media">
        {activity.image_url ? (
          <img src={activity.image_url} alt={activity.name} />
        ) : (
          <div className="activity-card__media-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="activity-info">
        <div className="activity-card__head">
          <h2>{activity.name}</h2>
          {dateLabel ? (
            <span className="activity-card__date">{dateLabel}</span>
          ) : null}
        </div>

        {activity.description ? <p>{activity.description}</p> : null}

        <div className="activity-card__footer">
          <button
            type="button"
            className="activity-card__register"
            onClick={goToPayment}
            disabled={isClosed}
          >
            {isClosed ? "סגור להרשמה" : "להרשמה"}
          </button>

          <div className="activity-card__details">
            {timeLabel ? (
              <span className="activity-card__detail">{timeLabel}</span>
            ) : null}
            <span className="activity-card__detail">
              {formatActivityPrice(activity.price)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ActivityCard;
