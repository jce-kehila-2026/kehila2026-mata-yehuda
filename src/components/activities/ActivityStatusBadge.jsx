import { getActivityDisplayStatus } from "../../utils/staffManegmentUtils/activityStatus";

function ActivityStatusBadge({ data, className = "" }) {
    const { label, badgeClass } = getActivityDisplayStatus(data);

    return (
        <span className={`${badgeClass}${className ? ` ${className}` : ""}`}>
            {label}
        </span>
    );
}

export default ActivityStatusBadge;
