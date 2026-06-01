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
    shouldShowParticipantAsInitialRequest,
    shouldShowRegistrationAsInitialRequest
} from "../utils/initialRequestFilters";

const registrationsCollection = collection(db, "registrations");
const participantsCollection = collection(db, "participants");

export const REGISTRATION_STATUS_PENDING = "ממתין";

export { REGISTRATION_STATUS_COMPLETED };

function readField(data, snakeKey, camelKey) {
    const value = data?.[snakeKey] ?? data?.[camelKey];
    return typeof value === "string" ? value.trim() : value ?? "";
}

export function resolveRegistrationProgramId(registration) {
    const programId = readField(registration, "program_id", "programId");

    if (programId) {
        return programId;
    }

    const activityId = readField(registration, "activity_id", "activityId");

    if (activityId) {
        return PROGRAM_60_PLUS_MINUS_ID;
    }

    return "";
}

export function resolveRegistrationActivityId(registration, programId) {
    const activityId = readField(registration, "activity_id", "activityId");
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

    return {
        id,
        participant_id: readField(data, "participant_id", "participantId"),
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

    return snapshot.docs.map((registrationDoc) =>
        normalizeRegistration(registrationDoc)
    );
}

function mergeRegistrationWithParticipant(registration, participant) {
    const programId = registration.program_id || participant?.program_id || "";
    const activityId =
        registration.activity_id || participant?.activity_id || "";

    return {
        ...participant,
        id: participant?.id || registration.participant_id,
        registrationId: registration.id,
        program_id: programId,
        program_title:
            participant?.program_title ||
            registration.program_title ||
            getFixedProgramTitle(programId),
        activity_id: activityId,
        activity_name: participant?.activity_name || "",
        registration_status:
            registration.registration_status || participant?.registration_status || "",
        id_number: participant?.id_number || "",
        phone: participant?.phone || ""
    };
}

async function fetchParticipantsForRequests() {
    const snapshot = await getDocs(participantsCollection);

    return snapshot.docs.map((participantDoc) => ({
        id: participantDoc.id,
        ...participantDoc.data()
    }));
}

export async function fetchInitialRegistrationRequests() {
    const [registrations, participants] = await Promise.all([
        fetchRegistrations(),
        fetchParticipantsForRequests()
    ]);

    const participantMap = new Map(participants.map((item) => [item.id, item]));
    const registrationParticipantIds = new Set();

    const fromRegistrations = registrations
        .filter(shouldShowRegistrationAsInitialRequest)
        .map((registration) => {
            if (registration.participant_id) {
                registrationParticipantIds.add(registration.participant_id);
            }

            const participant = participantMap.get(registration.participant_id);
            const merged = mergeRegistrationWithParticipant(
                registration,
                participant
            );

            if (!merged.id_number || !merged.phone || !merged.program_id) {
                return null;
            }

            return merged;
        })
        .filter(Boolean);

    const fromParticipants = participants
        .filter(shouldShowParticipantAsInitialRequest)
        .filter((participant) => !registrationParticipantIds.has(participant.id));

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

    console.log("[createInitialRegistration] registration payload", payload);

    const registrationRef = await addDoc(registrationsCollection, payload);

    console.log(
        "[createInitialRegistration] registration created id",
        registrationRef.id
    );

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
    const registrations = await fetchRegistrations();
    const existing = registrations.find(
        (item) => item.participant_id === participantId
    );

    const registrationData = {
        participant_id: participantId,
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
