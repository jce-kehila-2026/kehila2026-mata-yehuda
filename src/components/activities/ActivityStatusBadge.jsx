import { getActivityDisplayStatus } from "../../utils/activityStatus";

function ActivityStatusBadge({ data, className = "" }) {
    const { label, badgeClass } = getActivityDisplayStatus(data);

    return (
        <span className={`${badgeClass}${className ? ` ${className}` : ""}`}>
            {label}
        </span>
    );
}

export default ActivityStatusBadge;
