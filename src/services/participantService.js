import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import {
    DAY_CENTER_ID,
    PROGRAM_60_PLUS_MINUS_ID
} from "../utils/programConstants";
import {
    REGISTRATION_STATUS_COMPLETED,
    shouldShowParticipantAsInitialRequest
} from "../utils/initialRequestFilters";
import { validateParticipantForm } from "../components/participants/helpers/participantFormHelpers";
import {
    createInitialRegistration,
    syncRegistrationForParticipant
} from "./registrationService";

export const PARTICIPANT_VALIDATION_FAILED = "PARTICIPANT_VALIDATION_FAILED";

export const PARTICIPANT_CREATED_REGISTRATION_FAILED =
    "PARTICIPANT_CREATED_REGISTRATION_FAILED";

const participantsCollection = collection(db, "participants");

export { REGISTRATION_STATUS_COMPLETED, shouldShowParticipantAsInitialRequest as shouldShowAsInitialRequest };

function buildPersonalParticipantPayload(participantData) {
    return {
        first_name: participantData.first_name.trim(),
        last_name: participantData.last_name.trim(),
        id_number: participantData.id_number.trim(),
        birth_date: participantData.birth_date?.trim() || "",
        gender: participantData.gender?.trim() || "",
        phone: participantData.phone.trim(),
        address: participantData.address?.trim() || "",
        emergency_number: participantData.emergency_number?.trim() || "",
        medical_notes: participantData.medical_notes?.trim() || "",
        mobility_limitations: participantData.mobility_limitations?.trim() || ""
    };
}

function buildParticipantPayload(participantData) {
    const programId = participantData.program_id?.trim() || "";
    const is60Plus = programId === PROGRAM_60_PLUS_MINUS_ID;

    return {
        ...buildPersonalParticipantPayload(participantData),
        program_id: programId,
        program_title: participantData.program_title?.trim() || "",
        activity_id: is60Plus ? participantData.activity_id?.trim() || "" : "",
        activity_name: is60Plus ? participantData.activity_name?.trim() || "" : ""
    };
}

export async function fetchParticipants() {
    const snapshot = await getDocs(participantsCollection);

    return snapshot.docs.map((participantDoc) => ({
        id: participantDoc.id,
        ...participantDoc.data()
    }));
}

export async function completeParticipantRegistration(participantId, participantData) {
    const payload = buildParticipantPayload(participantData);
    const programId = payload.program_id;

    if (programId !== DAY_CENTER_ID) {
        payload.registration_status = REGISTRATION_STATUS_COMPLETED;
    }

    await updateDoc(doc(db, "participants", participantId), payload);

    await syncRegistrationForParticipant(participantId, payload);

    return payload;
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

    console.log("[addParticipant] participant created id", participantRef.id);

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
    return updateDoc(
        doc(db, "participants", participantId),
        buildParticipantPayload(participantData)
    );
}

export async function deleteParticipant(participantId) {
    return deleteDoc(doc(db, "participants", participantId));
}
