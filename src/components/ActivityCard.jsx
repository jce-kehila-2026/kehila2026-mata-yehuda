function ActivityCard({ activity }) {
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

        <p>תאריך: {startDate?.toLocaleDateString("he-IL")}</p>

        <p>
          שעה:{" "}
          {startDate?.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {endDate?.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <p>מחיר: ₪{activity.price}</p>

        <button>השתתף</button>
      </div>
    </div>
  );
}

export default ActivityCard;