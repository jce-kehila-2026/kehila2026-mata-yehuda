import { normalizeStatusKey } from "./statusMapUtils";

export const STAFF_ROLE_FILTER_OPTIONS = [
    { value: "admin", label: "מנהל" },
    { value: "staff", label: "איש צוות" }
];

export const STAFF_STATUS_FILTER_OPTIONS = [
    { value: "active", label: "פעיל" },
    { value: "inactive", label: "לא פעיל" }
];

const STAFF_ROLE_LABELS = {
    admin: "מנהל",
    staff: "איש צוות"
};

export function toSafeString(value) {
    return normalizeStatusKey(value);
}

export function getStaffNameParts(staff) {
    const fullName = toSafeString(staff?.full_name);
    const parts = fullName.split(/\s+/).filter(Boolean);

    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ")
    };
}

export function getStaffFullName(staff) {
    return toSafeString(staff?.full_name);
}

export function getStaffRoleKey(staff) {
    const role = toSafeString(staff?.role).toLowerCase();

    if (role === "admin") {
        return "admin";
    }

    return "staff";
}

export function getStaffRoleLabel(staffOrRole) {
    if (staffOrRole && typeof staffOrRole === "object") {
        return STAFF_ROLE_LABELS[getStaffRoleKey(staffOrRole)] || "איש צוות";
    }

    const role = toSafeString(staffOrRole).toLowerCase();

    return STAFF_ROLE_LABELS[role] || STAFF_ROLE_LABELS.staff;
}

export function getStaffActiveStatusLabel(isActive) {
    return isActive ? "פעיל" : "לא פעיל";
}

export function getStaffRoleBadgeVariant(staff) {
    return getStaffRoleKey(staff) === "admin" ? "admin" : "staff";
}

export function getStaffActiveBadgeVariant(isActive) {
    return isActive ? "success" : "muted";
}

export function matchesStaffRoleFilter(staff, filterValue) {
    if (!filterValue) {
        return true;
    }

    return getStaffRoleKey(staff) === filterValue;
}

export function matchesStaffStatusFilter(staff, filterValue) {
    if (!filterValue) {
        return true;
    }

    if (filterValue === "active") {
        return staff.is_active === true;
    }

    if (filterValue === "inactive") {
        return staff.is_active === false;
    }

    return true;
}
