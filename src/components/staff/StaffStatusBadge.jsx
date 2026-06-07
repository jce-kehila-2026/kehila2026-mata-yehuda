import {
    getStaffActiveBadgeVariant,
    getStaffActiveStatusLabel,
    getStaffRoleBadgeVariant,
    getStaffRoleLabel
} from "../../utils/staffStatusLabels";

function StaffStatusBadge({ type, staff, isActive }) {
    if (type === "role") {
        const variant = getStaffRoleBadgeVariant(staff);

        return (
            <span
                className={`staff-status-badge staff-status-badge--${variant}`}
            >
                {getStaffRoleLabel(staff)}
            </span>
        );
    }

    const variant = getStaffActiveBadgeVariant(isActive);

    return (
        <span className={`staff-status-badge staff-status-badge--${variant}`}>
            {getStaffActiveStatusLabel(isActive)}
        </span>
    );
}

export default StaffStatusBadge;
