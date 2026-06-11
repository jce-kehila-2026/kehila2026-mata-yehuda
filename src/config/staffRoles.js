/** Firestore `staff/{uid}.role` values */
export const STAFF_ROLE_GENERAL = "general_staff";
export const STAFF_ROLE_SUPPORTIVE_COMMUNITY = "supportive_community_staff";
export const DEFAULT_STAFF_ROLE = STAFF_ROLE_GENERAL;

export const STAFF_ROLE_OPTIONS = [
    { value: STAFF_ROLE_GENERAL, label: "איש צוות כללי" },
    {
        value: STAFF_ROLE_SUPPORTIVE_COMMUNITY,
        label: "איש צוות קהילה תומכת"
    }
];

export function normalizeStaffRole(role) {
    if (role === STAFF_ROLE_SUPPORTIVE_COMMUNITY) {
        return STAFF_ROLE_SUPPORTIVE_COMMUNITY;
    }

    return STAFF_ROLE_GENERAL;
}
