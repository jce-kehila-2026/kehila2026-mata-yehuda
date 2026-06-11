import {
    getStaffActiveBadgeVariant,
    getStaffActiveStatusLabel
} from "../../utils/staffManegmentUtils/staffStatusLabels";

function StaffStatusBadge({ isActive }) {
    const variant = getStaffActiveBadgeVariant(isActive);

    return (
        <span className={`staff-status-badge staff-status-badge--${variant}`}>
            {getStaffActiveStatusLabel(isActive)}
        </span>
    );
}

export default StaffStatusBadge;
