import { db } from "../../config/firebase";
import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

export const ARCHIVE_COLLECTIONS = {
    activities: "activities",
    programs: "programs",
    participants: "participants"
};

export async function archiveDocument(collectionName, documentId) {
    await updateDoc(doc(db, collectionName, documentId), {
        isArchived: true,
        archivedAt: serverTimestamp()
    });
}

export async function restoreDocument(collectionName, documentId) {
    await updateDoc(doc(db, collectionName, documentId), {
        isArchived: false,
        archivedAt: null
    });
}

export async function permanentlyDeleteDocument(collectionName, documentId) {
    await deleteDoc(doc(db, collectionName, documentId));
}
