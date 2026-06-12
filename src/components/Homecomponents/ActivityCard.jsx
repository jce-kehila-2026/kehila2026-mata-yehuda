import { useNavigate } from "react-router-dom";

function ActivityCard({ activity }) {
  const navigate = useNavigate();

  if (!activity) return null;

  const startDate = activity.start_date?.toDate();
  const endDate = activity.end_date?.toDate();

  return (
    <div className="activity-card">
      {activity.image_url && (
        <img src={activity.image_url} alt={activity.name} />
      )}

      <div className="activity-info">
        <div className={activity.is_open ? "status open" : "status closed"}>
          {activity.is_open ? "פתוח" : "סגור"}
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
        <button onClick={() => navigate(`/pay?activityId=${activity.id}`)}>השתתף</button>
      </div>
    </div>
  );
}

export default ActivityCard;