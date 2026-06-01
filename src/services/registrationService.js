import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    Timestamp
} from "firebase/firestore";
import {
    DAY_CENTER_ID,
    PROGRAM_60_PLUS_MINUS_ID,
    PROGRAM_TYPE_ACTIVITY_BASED,
    getFixedProgramTitle,
    getProgramTypeById,
    resolveCanonicalProgramId
} from "../utils/programConstants";
import {
    REGISTRATION_STATUS_COMPLETED,
    explainRegistrationRequestVisibility,
    hasRequiredRequestDisplayFields,
    shouldShowParticipantAsInitialRequest
} from "../utils/initialRequestFilters";
import { fetchActivities } from "./activityService";

const registrationsCollection = collection(db, "registrations");
const participantsCollection = collection(db, "participants");

export const REGISTRATION_STATUS_PENDING = "ממתין";

export { REGISTRATION_STATUS_COMPLETED };

/** Read a Firestore field by exact or trimmed key (handles accidental leading/trailing spaces in field names). */
function readRawByKeys(data, snakeKey, camelKey) {
    if (!data) {
        return undefined;
    }

    if (data[snakeKey] !== undefined && data[snakeKey] !== null) {
        return data[snakeKey];
    }

    if (data[camelKey] !== undefined && data[camelKey] !== null) {
        return data[camelKey];
    }

    for (const key of Object.keys(data)) {
        const trimmedKey = key.trim();

        if (trimmedKey === snakeKey || trimmedKey === camelKey) {
            return data[key];
        }
    }

    return undefined;
}

function readField(data, snakeKey, camelKey) {
    const value = readRawByKeys(data, snakeKey, camelKey);
    return typeof value === "string" ? value.trim() : value ?? "";
}

/** Normalize Firestore document ids (string, reference, or path). */
export function normalizeFirestoreId(value) {
    if (value == null || value === "") {
        return "";
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (trimmed.includes("/")) {
            const segments = trimmed.split("/").filter(Boolean);
            return (segments[segments.length - 1] || "").trim();
        }

        return trimmed;
    }

    if (typeof value === "object") {
        if (typeof value.id === "string" && value.id.trim()) {
            return value.id.trim();
        }

        if (typeof value.path === "string" && value.path.trim()) {
            const segments = value.path.split("/").filter(Boolean);
            return (segments[segments.length - 1] || "").trim();
        }
    }

    return String(value).trim();
}

function readIdField(data, snakeKey, camelKey) {
    const raw = readRawByKeys(data, snakeKey, camelKey);
    return normalizeFirestoreId(raw);
}

function readParticipantIdFromData(data) {
    return readIdField(data, "participant_id", "participantId");
}

export function getRegistrationParticipantId(registration) {
    if (!registration) {
        return "";
    }

    return normalizeFirestoreId(
        registration.participant_id ?? registration.participantId
    );
}

export function registrationMatchesParticipantId(registration, participantId) {
    const registrationParticipantId = getRegistrationParticipantId(registration);
    const normalizedParticipantId = normalizeFirestoreId(participantId);

    return (
        Boolean(registrationParticipantId) &&
        Boolean(normalizedParticipantId) &&
        registrationParticipantId === normalizedParticipantId
    );
}

function readParticipantIdFromRegistrationData(data) {
    return readIdField(data, "participant_id", "participantId");
}

export function getRegistrationProgramId(registration) {
    if (!registration) {
        return "";
    }

    return normalizeFirestoreId(registration.program_id ?? registration.programId);
}

export function getRegistrationActivityId(registration) {
    if (!registration) {
        return "";
    }

    return normalizeFirestoreId(registration.activity_id ?? registration.activityId);
}

export function resolveRegistrationProgramId(registration) {
    const programId = readIdField(registration, "program_id", "programId");

    if (programId) {
        return resolveCanonicalProgramId(programId);
    }

    const activityId = readIdField(registration, "activity_id", "activityId");

    if (activityId) {
        return PROGRAM_60_PLUS_MINUS_ID;
    }

    return "";
}

export function resolveRegistrationActivityId(registration, programId) {
    const activityId = readIdField(registration, "activity_id", "activityId");
    const resolvedProgramId = programId || resolveRegistrationProgramId(registration);

    if (resolvedProgramId === PROGRAM_60_PLUS_MINUS_ID) {
        return activityId;
    }

    return "";
}

export function normalizeRegistration(registrationDoc) {
    const data = registrationDoc.data ? registrationDoc.data() : registrationDoc;
    const id = registrationDoc.id || data.id;
    const programId = resolveRegistrationProgramId(data);
    const participant_id = readParticipantIdFromData(data);

    return {
        id,
        participant_id,
        program_id: programId,
        program_title: data.program_title || getFixedProgramTitle(programId),
        activity_id: resolveRegistrationActivityId(data, programId),
        payment_method: readField(data, "payment_method", "paymentMethod"),
        payment_status: readField(data, "payment_status", "paymentStatus"),
        registered_at: data.registered_at ?? data.registeredAt ?? null,
        cancel_deadline: data.cancel_deadline ?? data.cancelDeadline ?? null,
        registration_status: readField(
            data,
            "registration_status",
            "registrationStatus"
        )
    };
}

function buildRegistrationPayload(registrationData) {
    const programId = registrationData.program_id?.trim() || "";
    const is60Plus = programId === PROGRAM_60_PLUS_MINUS_ID;

    const payload = {
        participant_id: registrationData.participant_id?.trim() || "",
        program_id: programId,
        activity_id: is60Plus ? registrationData.activity_id?.trim() || "" : "",
        payment_method: registrationData.payment_method?.trim() || "",
        payment_status: registrationData.payment_status?.trim() || "",
        registration_status: registrationData.registration_status?.trim() || ""
    };

    if (registrationData.registered_at) {
        payload.registered_at = registrationData.registered_at;
    }

    if (registrationData.cancel_deadline) {
        payload.cancel_deadline = registrationData.cancel_deadline;
    }

    return payload;
}

function getRegistrationSortTime(registration) {
    const registeredAt = registration.registered_at;

    if (!registeredAt) {
        return 0;
    }

    if (registeredAt.toDate) {
        return registeredAt.toDate().getTime();
    }

    if (registeredAt.seconds) {
        return registeredAt.seconds * 1000;
    }

    const parsed = Date.parse(registeredAt);

    return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchRegistrations() {
    const snapshot = await getDocs(registrationsCollection);

    const registrations = snapshot.docs.map((registrationDoc) =>
        normalizeRegistration(registrationDoc)
    );

    const registration00 = registrations.find((registration) => registration.id === "00");

    if (registration00) {
        console.log("[Registration00]", registration00);
    }

    return registrations;
}

const REGISTRATION_LOOKUP_DEBUG_PARTICIPANT_ID = "a6SqVwA9kZHOVcc2lyam";

function shouldLogRegistrationLookup(participantId) {
    return (
        normalizeFirestoreId(participantId) === REGISTRATION_LOOKUP_DEBUG_PARTICIPANT_ID
    );
}

export async function getRegistrationByParticipantId(participantId) {
    const normalizedParticipantId = normalizeFirestoreId(participantId);

    if (!normalizedParticipantId) {
        return null;
    }

    const snapshot = await getDocs(registrationsCollection);
    const rawDocs = snapshot.docs;

    let matchedDoc = rawDocs.find((registrationDoc) => {
        const data = registrationDoc.data();
        const docParticipantId = readParticipantIdFromRegistrationData(data);

        return docParticipantId === normalizedParticipantId;
    });

    if (!matchedDoc) {
        matchedDoc = rawDocs.find((registrationDoc) =>
            registrationMatchesParticipantId(
                normalizeRegistration(registrationDoc),
                normalizedParticipantId
            )
        );
    }

    const matched = matchedDoc ? normalizeRegistration(matchedDoc) : null;

    if (shouldLogRegistrationLookup(participantId)) {
        console.log("[RegistrationLookupFinal]", {
            targetParticipantId: normalizedParticipantId,
            rawRegistrations: rawDocs.map((registrationDoc) => {
                const data = registrationDoc.data();

                return {
                    id: registrationDoc.id,
                    participant_id: data.participant_id,
                    participantId: data.participantId,
                    program_id: data.program_id,
                    programId: data.programId
                };
            }),
            matched
        });
    }

    return matched;
}

/** Alias for edit/load flows — registration linked by participant id. */
export const fetchRegistrationByParticipantId = getRegistrationByParticipantId;

function mergeRegistrationWithParticipant(
    registration,
    participant,
    activities = []
) {
    const programId = registration.program_id || "";
    const activityId = registration.activity_id || "";

    return {
        ...participant,
        id: participant?.id || registration.participant_id,
        registrationId: registration.id,
        registration,
        program_id: programId,
        program_title:
            registration.program_title || getFixedProgramTitle(programId),
        activity_id: activityId,
        activity_name: getRegistrationDisplayActivityName(
            registration,
            activities
        ),
        registration_status: registration.registration_status || "",
        id_number: String(participant?.id_number ?? "").trim(),
        phone: String(participant?.phone ?? "").trim(),
        registered_at: registration.registered_at ?? null
    };
}

async function fetchParticipantsForRequests() {
    const snapshot = await getDocs(participantsCollection);

    return snapshot.docs.map((participantDoc) => ({
        id: participantDoc.id,
        ...participantDoc.data()
    }));
}

function buildParticipantLookupMap(participants) {
    const participantMap = new Map();

    participants.forEach((participant) => {
        const docId = normalizeFirestoreId(participant.id);

        if (docId) {
            participantMap.set(docId, participant);
        }
    });

    return participantMap;
}

function lookupParticipantForRegistration(participantMap, participantId) {
    const normalizedParticipantId = normalizeFirestoreId(participantId);

    if (!normalizedParticipantId) {
        return null;
    }

    return participantMap.get(normalizedParticipantId) || null;
}

export async function fetchInitialRegistrationRequests() {
    const [registrations, participants, activities] = await Promise.all([
        fetchRegistrations(),
        fetchParticipantsForRequests(),
        fetchActivities()
    ]);

    const participantMap = buildParticipantLookupMap(participants);
    const registrationParticipantIds = new Set();
    const fromRegistrations = [];

    registrations.forEach((registration) => {
        const { shouldShow } = explainRegistrationRequestVisibility(registration);

        if (!shouldShow) {
            return;
        }

        const participantId = normalizeFirestoreId(registration.participant_id);
        const participant = lookupParticipantForRegistration(
            participantMap,
            participantId
        );

        if (participantId) {
            registrationParticipantIds.add(participantId);
        }

        const merged = mergeRegistrationWithParticipant(
            registration,
            participant,
            activities
        );

        if (!hasRequiredRequestDisplayFields(merged)) {
            return;
        }

        fromRegistrations.push(merged);
    });

    const fromParticipants = participants
        .filter(shouldShowParticipantAsInitialRequest)
        .filter(
            (participant) =>
                !registrationParticipantIds.has(normalizeFirestoreId(participant.id))
        );

    const combined = [...fromRegistrations, ...fromParticipants];

    return combined.sort((a, b) => {
        const timeB =
            getRegistrationSortTime(b) ||
            (b.created_at?.toDate
                ? b.created_at.toDate().getTime()
                : b.created_at?.seconds
                  ? b.created_at.seconds * 1000
                  : 0);
        const timeA =
            getRegistrationSortTime(a) ||
            (a.created_at?.toDate
                ? a.created_at.toDate().getTime()
                : a.created_at?.seconds
                  ? a.created_at.seconds * 1000
                  : 0);
        return timeB - timeA;
    });
}

function buildNewParticipantRegistrationPayload(
    participantId,
    participantData,
    programs = []
) {
    const programId = resolveCanonicalProgramId(participantData.program_id);

    if (!programId) {
        throw new Error("REGISTRATION_PROGRAM_ID_REQUIRED");
    }

    const isActivityBased =
        getProgramTypeById(participantData.program_id, programs) ===
        PROGRAM_TYPE_ACTIVITY_BASED;

    const activityId = isActivityBased
        ? participantData.activity_id?.trim() || ""
        : "";

    if (isActivityBased && !activityId) {
        throw new Error("REGISTRATION_ACTIVITY_ID_REQUIRED");
    }

    return {
        participant_id: participantId,
        program_id: programId,
        activity_id: activityId,
        payment_method: "",
        payment_status: "",
        registration_status: REGISTRATION_STATUS_PENDING,
        cancel_deadline: "",
        registered_at: Timestamp.now()
    };
}

export async function createInitialRegistration(
    participantId,
    participantData,
    programs = []
) {
    const payload = buildNewParticipantRegistrationPayload(
        participantId,
        participantData,
        programs
    );

    const registrationRef = await addDoc(registrationsCollection, payload);

    return registrationRef;
}

export async function addRegistration(registrationData) {
    const payload = buildRegistrationPayload(registrationData);

    if (!payload.registered_at) {
        payload.registered_at = Timestamp.now();
    }

    return addDoc(registrationsCollection, payload);
}

export async function updateRegistration(registrationId, registrationData) {
    const currentSnap = await getDoc(doc(db, "registrations", registrationId));
    const existingData = currentSnap.exists()
        ? normalizeRegistration(currentSnap)
        : {};

    const payload = buildRegistrationPayload({
        ...existingData,
        ...registrationData,
        registered_at: existingData.registered_at,
        cancel_deadline: existingData.cancel_deadline
    });

    return updateDoc(doc(db, "registrations", registrationId), payload);
}

export async function completeRegistration(registrationId, registrationData) {
    const payload = buildRegistrationPayload(registrationData);
    const programId = payload.program_id;

    if (programId !== DAY_CENTER_ID) {
        payload.registration_status = REGISTRATION_STATUS_COMPLETED;
    }

    if (!payload.registered_at) {
        payload.registered_at = Timestamp.now();
    }

    return updateDoc(doc(db, "registrations", registrationId), payload);
}

export async function syncRegistrationForParticipant(participantId, participantData) {
    const normalizedParticipantId = normalizeFirestoreId(participantId);
    const registrations = await fetchRegistrations();
    const existing = registrations.find(
        (item) => getRegistrationParticipantId(item) === normalizedParticipantId
    );

    const registrationData = {
        participant_id: normalizedParticipantId,
        program_id: participantData.program_id,
        activity_id: participantData.activity_id,
        payment_method: existing?.payment_method || "",
        payment_status: existing?.payment_status || "",
        registration_status: existing?.registration_status || "",
        registered_at: existing?.registered_at,
        cancel_deadline: existing?.cancel_deadline
    };

    const programId = participantData.program_id?.trim() || "";

    if (programId && programId !== DAY_CENTER_ID) {
        registrationData.registration_status = REGISTRATION_STATUS_COMPLETED;
    }

    if (existing?.id) {
        return updateRegistration(existing.id, registrationData);
    }

    return addRegistration(registrationData);
}

export function getRegistrationDisplayProgramTitle(registration) {
    if (registration.program_title) {
        return registration.program_title;
    }

    return getFixedProgramTitle(registration.program_id);
}

export function getRegistrationDisplayActivityName(registration, activities = []) {
    if (registration.activity_name) {
        return registration.activity_name;
    }

    const activityId = registration.activity_id;

    if (!activityId) {
        return "";
    }

    const activity = activities.find((item) => item.id === activityId);

    return activity?.data?.name || activity?.name || "";
}
