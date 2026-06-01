import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import { PROGRAM_60_PLUS_MINUS_ID } from "../utils/programConstants";

const participantsCollection = collection(db, "participants");

function buildParticipantPayload(participantData) {
    const programId = participantData.program_id?.trim() || "";
    const is60Plus = programId === PROGRAM_60_PLUS_MINUS_ID;

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
        mobility_limitations: participantData.mobility_limitations?.trim() || "",
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

export async function addParticipant(participantData) {
    return addDoc(participantsCollection, buildParticipantPayload(participantData));
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
