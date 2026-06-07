import { normalizeStatusKey } from "./statusMapUtils";

export const STAFF_STATUS_FILTER_OPTIONS = [
    { value: "active", label: "פעיל" },
    { value: "inactive", label: "לא פעיל" }
];

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

export function getStaffActiveStatusLabel(isActive) {
    return isActive ? "פעיל" : "לא פעיל";
}

export function getStaffActiveBadgeVariant(isActive) {
    return isActive ? "success" : "muted";
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
