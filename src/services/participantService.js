import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
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
            program_id: registration?.program_id || "",
            activity_id: registration?.activity_id || ""
        };
    });
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
