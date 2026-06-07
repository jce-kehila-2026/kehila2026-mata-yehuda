import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    getCountFromServer,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit
} from "firebase/firestore";
import { normalizeSearchQuery } from "../utils/adminListUtils";
import { resolveCanonicalProgramId } from "../utils/programConstants";
import { toSafeString, matchesPaymentStatusFilter, matchesRegistrationStatusFilter } from "../utils/participantStatusLabels";
import { shouldShowParticipantAsInitialRequest } from "../utils/initialRequestFilters";
import {
    extractParticipantPersonalFields,
    validateParticipantForm
} from "../components/participants/helpers/participantFormHelpers";
import { parseBirthDateToTimestamp } from "../utils/dateUtils";
import {
    createInitialRegistration,
    completeRegistration,
    fetchRegistrations,
    syncRegistrationForParticipant
} from "./registrationService";

export const PARTICIPANT_VALIDATION_FAILED = "PARTICIPANT_VALIDATION_FAILED";

export const PARTICIPANT_CREATED_REGISTRATION_FAILED =
    "PARTICIPANT_CREATED_REGISTRATION_FAILED";

const participantsCollection = collection(db, "participants");
const ADMIN_QUERY_LIMIT = 1000;

export function filterParticipantsList(
    participantList,
    searchQuery,
    filters = {}
) {
    const queryText = normalizeSearchQuery(searchQuery);
    const programFilter = filters.programFilter || "";
    const statusFilter = filters.statusFilter || "";
    const paymentFilter = filters.paymentFilter || "";

    return participantList.filter((participant) => {
        if (
            programFilter &&
            resolveCanonicalProgramId(participant.program_id) !==
                resolveCanonicalProgramId(programFilter)
        ) {
            return false;
        }

        if (
            statusFilter &&
            !matchesRegistrationStatusFilter(
                participant.registration_status,
                statusFilter
            )
        ) {
            return false;
        }

        if (paymentFilter === "__none__") {
            if (toSafeString(participant.payment_status)) {
                return false;
            }
        } else if (
            paymentFilter &&
            !matchesPaymentStatusFilter(
                participant.payment_status,
                paymentFilter
            )
        ) {
            return false;
        }

        if (!queryText) {
            return true;
        }

        const firstName = normalizeSearchQuery(toSafeString(participant.first_name));
        const lastName = normalizeSearchQuery(toSafeString(participant.last_name));
        const fullName = `${firstName} ${lastName}`.trim();
        const idNumber = normalizeSearchQuery(toSafeString(participant.id_number));
        const phone = normalizeSearchQuery(toSafeString(participant.phone));

        return (
            fullName.includes(queryText) ||
            firstName.includes(queryText) ||
            lastName.includes(queryText) ||
            idNumber.includes(queryText) ||
            phone.includes(queryText)
        );
    });
}

export function getParticipantSortValue(participant, sortField) {
    switch (sortField) {
        case "name":
            return `${toSafeString(participant.first_name)} ${toSafeString(participant.last_name)}`.trim();
        case "id_number":
            return toSafeString(participant.id_number);
        case "phone":
            return toSafeString(participant.phone);
        case "status":
            return toSafeString(participant.registration_status);
        case "program":
            return toSafeString(participant.program_id);
        case "registration_date":
            return participant.registered_at || null;
        case "payment_status":
            return toSafeString(participant.payment_status);
        default:
            return `${toSafeString(participant.first_name)} ${toSafeString(participant.last_name)}`.trim();
    }
}

function mergeParticipantRegistrations(participants, registrations) {
    const registrationByParticipantId = new Map();

    registrations.forEach((registration) => {
        if (registration.participant_id) {
            registrationByParticipantId.set(
                registration.participant_id,
                registration
            );
        }
    });

    return participants.map((participant) => {
        const registration =
            registrationByParticipantId.get(participant.id) || null;

        return {
            ...participant,
            registration,
            registrationId: registration?.id || null,
            registration_status: registration?.registration_status || "",
            payment_status: registration?.payment_status || "",
            registered_at: registration?.registered_at || null,
            program_id: registration?.program_id || "",
            activity_id: registration?.activity_id || ""
        };
    });
}

export async function countParticipantRecords() {
    const snapshot = await getCountFromServer(query(participantsCollection));
    return snapshot.data().count;
}

export async function fetchParticipantsForAdminList() {
    const [participantSnapshot, registrations] = await Promise.all([
        getDocs(
            query(
                participantsCollection,
                orderBy("last_name"),
                limit(ADMIN_QUERY_LIMIT)
            )
        ),
        fetchRegistrations()
    ]);

    const participants = participantSnapshot.docs.map((participantDoc) => ({
        id: participantDoc.id,
        ...participantDoc.data()
    }));

    return mergeParticipantRegistrations(participants, registrations);
}

export {
    REGISTRATION_STATUS_COMPLETED,
    shouldShowParticipantAsInitialRequest as shouldShowAsInitialRequest
} from "../utils/initialRequestFilters";

function buildPersonalParticipantPayload(participantData) {
    const personal = extractParticipantPersonalFields(participantData);

    return {
        first_name: personal.first_name,
        last_name: personal.last_name,
        id_number: personal.id_number,
        birth_date: parseBirthDateToTimestamp(personal.birth_date),
        gender: personal.gender,
        phone: personal.phone,
        address: personal.address,
        emergency_number: personal.emergency_number,
        medical_notes: personal.medical_notes,
        mobility_limitations: personal.mobility_limitations,
        marketing_consent: Boolean(personal.marketing_consent)
    };
}

function buildRegistrationSyncData(participantId, participantData) {
    return {
        participant_id: participantId,
        program_id: participantData.program_id?.trim() || "",
        activity_id: participantData.activity_id?.trim() || "",
        payment_method: participantData.payment_method?.trim() || "",
        payment_status: participantData.payment_status?.trim() || "",
        registration_status: participantData.registration_status?.trim() || ""
    };
}

export async function fetchParticipants() {
    const snapshot = await getDocs(participantsCollection);

    return snapshot.docs.map((participantDoc) => ({
        id: participantDoc.id,
        ...participantDoc.data()
    }));
}

export async function fetchParticipantsWithRegistrations() {
    const [participants, registrations] = await Promise.all([
        fetchParticipants(),
        fetchRegistrations()
    ]);

    return mergeParticipantRegistrations(participants, registrations);
}

export async function completeParticipantRegistration(
    participantId,
    participantData,
    registrationId = null
) {
    const personalPayload = buildPersonalParticipantPayload(participantData);

    await updateDoc(doc(db, "participants", participantId), personalPayload);

    if (registrationId) {
        return completeRegistration(
            registrationId,
            buildRegistrationSyncData(participantId, participantData)
        );
    }

    return syncRegistrationForParticipant(participantId, participantData);
}

export async function addParticipant(participantData, programs = []) {
    const validationError = validateParticipantForm(participantData, programs);

    if (validationError) {
        const error = new Error(PARTICIPANT_VALIDATION_FAILED);
        error.validationMessage = validationError;
        throw error;
    }

    const participantPayload = buildPersonalParticipantPayload(participantData);

    const participantRef = await addDoc(participantsCollection, participantPayload);

    try {
        await createInitialRegistration(
            participantRef.id,
            participantData,
            programs
        );
    } catch (err) {
        console.error("[addParticipant] registration creation failed", err);

        const error = new Error(PARTICIPANT_CREATED_REGISTRATION_FAILED);
        error.participantId = participantRef.id;
        error.cause = err;
        throw error;
    }

    return participantRef;
}

export async function updateParticipant(participantId, participantData) {
    await updateDoc(
        doc(db, "participants", participantId),
        buildPersonalParticipantPayload(participantData)
    );

    return syncRegistrationForParticipant(participantId, participantData);
}

export async function deleteParticipant(participantId) {
    return deleteDoc(doc(db, "participants", participantId));
}
