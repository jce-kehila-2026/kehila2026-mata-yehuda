import ActivityCard from "./ActivityCard";

function ActivityList({ activities, onDelete, onEdit }) {
    return (
        <div className="activities-container">
            {activities.map((activity) => (
                <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
}

export default ActivityList;
