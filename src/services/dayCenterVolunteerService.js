import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    deleteField,
    doc,
    getDocs,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";
import {
    compareAdminValues,
    normalizeSearchQuery
} from "../utils/staffManegmentUtils/adminListUtils";

const VOLUNTEERS_COLLECTION = "daycenterVolunteers";
const volunteersCollection = collection(db, VOLUNTEERS_COLLECTION);

export const VOLUNTEER_STATUS_FILTER_ALL = "all";
export const VOLUNTEER_STATUS_FILTER_ACTIVE = "active";
export const VOLUNTEER_STATUS_FILTER_INACTIVE = "inactive";

export function getVolunteerStatusLabel(isActive) {
    return isActive ? "פעיל" : "לא פעיל";
}

function readField(data, snakeKey, camelKey) {
    const snakeValue = data?.[snakeKey];
    const camelValue = data?.[camelKey];

    if (snakeValue != null && String(snakeValue).trim() !== "") {
        return String(snakeValue).trim();
    }

    if (camelValue != null && String(camelValue).trim() !== "") {
        return String(camelValue).trim();
    }

    return "";
}

function normalizeVolunteer(volunteerDoc) {
    const data = volunteerDoc.data();

    return {
        id: volunteerDoc.id,
        first_name: readField(data, "first_name", "firstName"),
        last_name: readField(data, "last_name", "lastName"),
        phone: readField(data, "phone", "phone"),
        id_number: readField(data, "id_number", "idNumber"),
        about_me: readField(data, "about_me", "aboutMe"),
        is_active: typeof data?.is_active === "boolean" ? data.is_active : true,
        request_id: readField(data, "request_id", "requestId"),
        approved_at: data?.approved_at ?? data?.approvedAt ?? null,
        deactivated_at: data?.deactivated_at ?? data?.deactivatedAt ?? null,
        created_at: data?.created_at ?? data?.createdAt ?? null,
        updated_at: data?.updated_at ?? data?.updatedAt ?? null
    };
}

export function isDisplayableVolunteer(volunteer) {
    return Boolean(
        volunteer.first_name?.trim() ||
            volunteer.last_name?.trim() ||
            volunteer.id_number?.trim() ||
            volunteer.phone?.trim()
    );
}

function getVolunteerFullName(volunteer) {
    return [volunteer.first_name, volunteer.last_name]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");
}

function getVolunteerSortName(volunteer) {
    return getVolunteerFullName(volunteer).toLowerCase();
}

export function filterDayCenterVolunteersList(items, searchQuery, statusFilter = VOLUNTEER_STATUS_FILTER_ALL) {
    const queryText = normalizeSearchQuery(searchQuery);

    return items.filter((volunteer) => {
        if (!isDisplayableVolunteer(volunteer)) {
            return false;
        }

        if (statusFilter === VOLUNTEER_STATUS_FILTER_ACTIVE && !volunteer.is_active) {
            return false;
        }

        if (statusFilter === VOLUNTEER_STATUS_FILTER_INACTIVE && volunteer.is_active) {
            return false;
        }

        if (!queryText) {
            return true;
        }

        const searchable = normalizeSearchQuery(
            [
                volunteer.first_name,
                volunteer.last_name,
                getVolunteerFullName(volunteer),
                volunteer.id_number,
                volunteer.phone,
                volunteer.about_me
            ].join(" ")
        );

        return searchable.includes(queryText);
    });
}

export function sortDayCenterVolunteersWithActiveFirst(
    items,
    sortField = "name",
    sortDirection = "asc"
) {
    return [...items].sort((leftItem, rightItem) => {
        if (leftItem.is_active !== rightItem.is_active) {
            return leftItem.is_active ? -1 : 1;
        }

        return compareAdminValues(
            getDayCenterVolunteerSortValue(leftItem, sortField),
            getDayCenterVolunteerSortValue(rightItem, sortField),
            sortDirection
        );
    });
}

export function getDayCenterVolunteerSortValue(volunteer, sortField) {
    switch (sortField) {
        case "name":
            return getVolunteerSortName(volunteer);
        case "id_number":
            return volunteer.id_number || "";
        case "phone":
            return volunteer.phone || "";
        case "about_me":
            return volunteer.about_me || "";
        case "is_active":
            return volunteer.is_active ? 1 : 0;
        default:
            return getVolunteerSortName(volunteer);
    }
}

export async function getDayCenterVolunteers() {
    const snapshot = await getDocs(volunteersCollection);

    return sortDayCenterVolunteersWithActiveFirst(
        snapshot.docs.map(normalizeVolunteer).filter(isDisplayableVolunteer),
        "name",
        "asc"
    );
}

function buildVolunteerPayload(formData, { includeCreatedAt = false } = {}) {
    const payload = {
        first_name: formData.first_name?.trim() || "",
        last_name: formData.last_name?.trim() || "",
        phone: formData.phone?.trim() || "",
        id_number: formData.id_number?.trim() || "",
        updated_at: serverTimestamp()
    };

    if (formData.about_me !== undefined) {
        payload.about_me = formData.about_me?.trim() || "";
    }

    if (formData.is_active !== undefined) {
        payload.is_active = formData.is_active !== false;
    }

    if (formData.request_id) {
        payload.request_id = formData.request_id;
    }

    if (formData.approved_at) {
        payload.approved_at = formData.approved_at;
    }

    if (includeCreatedAt) {
        payload.created_at = serverTimestamp();
    }

    return payload;
}

export async function createVolunteerFromRequest(request, requestId) {
    return addDoc(
        volunteersCollection,
        buildVolunteerPayload(
            {
                first_name: request.first_name,
                last_name: request.last_name,
                phone: request.phone,
                id_number: request.id_number,
                about_me: request.about_me,
                is_active: true,
                request_id: requestId,
                approved_at: serverTimestamp()
            },
            { includeCreatedAt: true }
        )
    );
}

export async function addDayCenterVolunteer(formData) {
    return addDoc(
        volunteersCollection,
        buildVolunteerPayload(
            {
                ...formData,
                is_active: formData.is_active !== false
            },
            { includeCreatedAt: true }
        )
    );
}

export async function updateDayCenterVolunteer(volunteerId, formData) {
    if (!volunteerId) {
        throw new Error("missing volunteer id");
    }

    const payload = buildVolunteerPayload({
        ...formData,
        is_active: formData.is_active !== false
    });

    if (formData.is_active === false) {
        payload.deactivated_at = serverTimestamp();
    } else if (formData.is_active === true) {
        payload.deactivated_at = deleteField();
    }

    return updateDoc(doc(db, VOLUNTEERS_COLLECTION, volunteerId), payload);
}

export async function deactivateDayCenterVolunteer(volunteerId) {
    if (!volunteerId) {
        throw new Error("missing volunteer id");
    }

    return updateDoc(doc(db, VOLUNTEERS_COLLECTION, volunteerId), {
        is_active: false,
        deactivated_at: serverTimestamp(),
        updated_at: serverTimestamp()
    });
}

export async function reactivateDayCenterVolunteer(volunteerId) {
    if (!volunteerId) {
        throw new Error("missing volunteer id");
    }

    return updateDoc(doc(db, VOLUNTEERS_COLLECTION, volunteerId), {
        is_active: true,
        deactivated_at: deleteField(),
        updated_at: serverTimestamp()
    });
}

/** @deprecated Use deactivateDayCenterVolunteer */
export async function deleteDayCenterVolunteer(volunteerId) {
    return deactivateDayCenterVolunteer(volunteerId);
}

export function getVolunteerDisplayName(volunteer) {
    return getVolunteerFullName(volunteer) || "—";
}
