import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

export const getActiveLanguages = async () => {
  const q = query(
    collection(db, "languages"),
    where("is_active", "==", true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};

export const getActiveHelpTypes = async () => {
  const q = query(
    collection(db, "helpTypes"),
    where("is_active", "==", true)
  );

  const snapshot = await getDocs(q);

  const helpTypes = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  const hasOther = helpTypes.some((type) => type.id === "other");

  if (!hasOther) {
    helpTypes.push({
      id: "other",
      help_name: "אחר",
      is_active: true,
    });
  }

  return helpTypes;
};

export const saveCommunityJoinRequest = async (formData) => {
  let participantDocId;

  const participantsQuery = query(
    collection(db, "participants"),
    where("id_number", "==", formData.participantId)
  );

  const participantsSnapshot = await getDocs(participantsQuery);

  if (!participantsSnapshot.empty) {
    participantDocId = participantsSnapshot.docs[0].id;
  } else {
    const participantRef = await addDoc(collection(db, "participants"), {
      id_number: formData.participantId,
      first_name: formData.participantName,
      phone: formData.phone,
      address: formData.address,
      createdAt: serverTimestamp(),
    });

    participantDocId = participantRef.id;
  }

  await addDoc(collection(db, "communitySubscriptions"), {
    participant_ref: participantDocId,
    requestedServices: formData.services,
    otherService: formData.otherService,
    languages: formData.languages,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const checkCommunityMembership = async (participantId, phone) => {
  const participantsQuery = query(
    collection(db, "participants"),
    where("id_number", "==", participantId),
    where("phone", "==", phone)
  );

  const participantsSnapshot = await getDocs(participantsQuery);

  if (participantsSnapshot.empty) {
    return {
      exists: false,
      message: "לא נמצא משתתף עם הפרטים שהוזנו",
    };
  }

  const participantDoc = participantsSnapshot.docs[0];
  const participantDocId = participantDoc.id;

  const subscriptionQuery = query(
    collection(db, "communitySubscriptions"),
    where("participant_ref", "==", participantDocId),
    where("status", "==", "active")
  );

  const subscriptionSnapshot = await getDocs(subscriptionQuery);

  if (subscriptionSnapshot.empty) {
    return {
      exists: false,
      message: "לא נמצאה חברות פעילה בקהילה תומכת",
    };
  }

  return {
    exists: true,
    participantDocId,
    participantData: participantDoc.data(),
  };
};

export const saveHomeHelpRequest = async (requestData) => {
  await addDoc(collection(db, "homeHelpRequests"), {
    participant_ref: requestData.participantDocId,
    requestedServices: requestData.services,
    otherService: requestData.otherService,
    notes: requestData.notes,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};
