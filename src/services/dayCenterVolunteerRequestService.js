import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { normalizeSearchQuery } from "../utils/staffManegmentUtils/adminListUtils";
import { createVolunteerFromRequest } from "./dayCenterVolunteerService";
import { nameContainsNumber } from "../utils/nameValidation";

const requestsCollection = collection(db, "day_center_volunteer_requests");

export const REQUEST_STATUS_PENDING = "pending";
export const REQUEST_STATUS_APPROVED = "approved";
export const REQUEST_STATUS_REJECTED = "rejected";

export const REQUEST_STATUS_LABELS = {
    [REQUEST_STATUS_PENDING]: "ממתין לאישור",
    [REQUEST_STATUS_APPROVED]: "אושר",
    [REQUEST_STATUS_REJECTED]: "נדחה"
};

function normalizeRequest(requestDoc) {
    const data = requestDoc.data();

    return {
        id: requestDoc.id,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        id_number: data.id_number || data.idNumber || "",
        about_me: data.about_me || data.aboutMe || "",
        status: data.status || REQUEST_STATUS_PENDING,
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
        approved_at: data.approved_at || null,
        rejected_at: data.rejected_at || null
    };
}

function getRequestFullName(request) {
    return [request.first_name, request.last_name]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");
}

function getRequestSortName(request) {
    return getRequestFullName(request).toLowerCase();
}

export function getRequestDisplayName(request) {
    return getRequestFullName(request) || "—";
}

export function getRequestStatusLabel(status) {
    return REQUEST_STATUS_LABELS[status] || status || "—";
}

export function formatRequestTimestamp(value) {
    if (!value) {
        return "—";
    }

    const date = value.toDate ? value.toDate() : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

export function filterDayCenterVolunteerRequestsList(
    items,
    searchQuery,
    statusFilter = ""
) {
    const queryText = normalizeSearchQuery(searchQuery);

    return items.filter((request) => {
        if (statusFilter && request.status !== statusFilter) {
            return false;
        }

        if (!queryText) {
            return true;
        }

        const searchable = normalizeSearchQuery(
            [
                request.first_name,
                request.last_name,
                request.phone,
                request.id_number,
                request.about_me,
                getRequestStatusLabel(request.status)
            ].join(" ")
        );

        return searchable.includes(queryText);
    });
}

export function getDayCenterVolunteerRequestSortValue(request, sortField) {
    switch (sortField) {
        case "name":
            return getRequestSortName(request);
        case "phone":
            return request.phone || "";
        case "status":
            return request.status || "";
        case "created_at":
            return request.created_at?.seconds || 0;
        default:
            return getRequestSortName(request);
    }
}

export const INVALID_ID_NUMBER_MESSAGE =
    "יש להזין מספר תעודת זהות תקין בן 9 ספרות";

export const INVALID_PHONE_MESSAGE = "יש להזין מספר טלפון תקין";

export function isValidIsraeliPhoneNumber(value) {
    const digits = String(value || "").replace(/\D/g, "");

    if (!digits) {
        return false;
    }

    return /^05\d{8}$/.test(digits) || /^0[2-9]\d{7,8}$/.test(digits);
}

export function isValidIsraeliIdNumber(value) {
    return /^\d{9}$/.test(String(value || "").trim());
}

export function validateDayCenterVolunteerRequestForm(form) {
    if (!form.first_name?.trim()) {
        return "נא למלא שם פרטי";
    }

    if (nameContainsNumber(form.first_name)) {
        return "שם פרטי אינו יכול להכיל מספרים";
    }

    if (!form.last_name?.trim()) {
        return "נא למלא שם משפחה";
    }

    if (nameContainsNumber(form.last_name)) {
        return "שם משפחה אינו יכול להכיל מספרים";
    }

    if (!form.phone?.trim()) {
        return INVALID_PHONE_MESSAGE;
    }

    if (!isValidIsraeliIdNumber(form.id_number)) {
        return INVALID_ID_NUMBER_MESSAGE;
    }

    if (!isValidIsraeliPhoneNumber(form.phone)) {
        return INVALID_PHONE_MESSAGE;
    }

    return "";
}

function buildRequestPayload(formData, { includeCreatedAt = false } = {}) {
    const phoneDigits = String(formData.phone || "").replace(/\D/g, "");

    const payload = {
        first_name: formData.first_name?.trim() || "",
        last_name: formData.last_name?.trim() || "",
        phone: phoneDigits,
        id_number: formData.id_number?.trim() || "",
        about_me: formData.about_me?.trim() || "",
        status: REQUEST_STATUS_PENDING,
        updated_at: serverTimestamp()
    };

    if (includeCreatedAt) {
        payload.created_at = serverTimestamp();
    }

    return payload;
}

export async function submitDayCenterVolunteerRequest(formData) {
    const validationError = validateDayCenterVolunteerRequestForm(formData);

    if (validationError) {
        throw new Error(validationError);
    }

    return addDoc(
        requestsCollection,
        buildRequestPayload(formData, { includeCreatedAt: true })
    );
}

export async function getDayCenterVolunteerRequests(statusFilter = "") {
    let snapshot;

    if (statusFilter) {
        snapshot = await getDocs(
            query(requestsCollection, where("status", "==", statusFilter))
        );
    } else {
        snapshot = await getDocs(requestsCollection);
    }

    return snapshot.docs
        .map(normalizeRequest)
        .sort((a, b) => {
            const aTime = a.created_at?.seconds || 0;
            const bTime = b.created_at?.seconds || 0;
            return bTime - aTime;
        });
}

export async function getPendingDayCenterVolunteerRequests() {
    return getDayCenterVolunteerRequests(REQUEST_STATUS_PENDING);
}

export async function approveDayCenterVolunteerRequest(requestId) {
    if (!requestId) {
        throw new Error("missing request id");
    }

    const requestRef = doc(db, "day_center_volunteer_requests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
        throw new Error("request not found");
    }

    const request = normalizeRequest(requestSnap);

    if (request.status !== REQUEST_STATUS_PENDING) {
        throw new Error("request is not pending");
    }

    await createVolunteerFromRequest(request, requestId);

    await updateDoc(requestRef, {
        status: REQUEST_STATUS_APPROVED,
        approved_at: serverTimestamp(),
        updated_at: serverTimestamp()
    });
}

export async function rejectDayCenterVolunteerRequest(requestId) {
    if (!requestId) {
        throw new Error("missing request id");
    }

    const requestRef = doc(db, "day_center_volunteer_requests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
        throw new Error("request not found");
    }

    const request = normalizeRequest(requestSnap);

    if (request.status !== REQUEST_STATUS_PENDING) {
        throw new Error("request is not pending");
    }

    await updateDoc(requestRef, {
        status: REQUEST_STATUS_REJECTED,
        rejected_at: serverTimestamp(),
        updated_at: serverTimestamp()
    });
}
