import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

function cleanStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values.filter((value) => String(value ?? "").trim() !== "")
    ),
  ];
}

function mergeUniqueStringArrays(existingValues, newValues) {
  return cleanStringArray([
    ...(Array.isArray(existingValues) ? existingValues : []),
    ...cleanStringArray(newValues),
  ]);
}

function getParticipantRefId(participantRef) {
  if (!participantRef) {
    return "";
  }

  if (typeof participantRef === "string") {
    return participantRef;
  }

  if (participantRef.id) {
    return participantRef.id;
  }

  if (participantRef.path) {
    const pathParts = participantRef.path.split("/");
    return pathParts[pathParts.length - 1] || "";
  }

  return "";
}

async function resolveParticipantDocId(participantRefValue) {
  const rawValue = getParticipantRefId(participantRefValue);

  if (!rawValue) {
    return "";
  }

  const participantDocSnapshot = await getDoc(doc(db, "participants", rawValue));

  if (participantDocSnapshot.exists()) {
    return participantDocSnapshot.id;
  }

  let participantByIdNumberSnapshot = await getDocs(
    query(
      collection(db, "participants"),
      where("id_number", "==", rawValue)
    )
  );

  if (participantByIdNumberSnapshot.empty && /^\d+$/.test(rawValue)) {
    participantByIdNumberSnapshot = await getDocs(
      query(
        collection(db, "participants"),
        where("id_number", "==", Number(rawValue))
      )
    );
  }

  if (!participantByIdNumberSnapshot.empty) {
    return participantByIdNumberSnapshot.docs[0].id;
  }

  return "";
}

function mergeDescription(existingDescription, newDescription) {
  const existing = existingDescription?.trim() || "";
  const incoming = newDescription?.trim() || "";

  if (!incoming) {
    return existing;
  }

  if (!existing) {
    return incoming;
  }

  if (existing.includes(incoming)) {
    return existing;
  }

  return `${existing}\n${incoming}`;
}

async function findHomeHelpRequestByParticipantRef(participantDocId) {
  let snapshot = await getDocs(
    query(
      collection(db, "homeHelpRequests"),
      where("participant_ref", "==", participantDocId)
    )
  );

  if (snapshot.empty && participantDocId) {
    snapshot = await getDocs(
      query(
        collection(db, "homeHelpRequests"),
        where(
          "participant_ref",
          "==",
          doc(db, "participants", participantDocId)
        )
      )
    );
  }

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0];
}

function getSubscriptionRequestedHelpTypes(subscription) {
  return cleanStringArray(
    subscription.requestedHelpTypes ?? subscription.requestedServices
  );
}

function arraysMatchAsSets(arrayA, arrayB) {
  const setA = new Set(cleanStringArray(arrayA));
  const setB = new Set(cleanStringArray(arrayB));

  if (setA.size !== setB.size) {
    return false;
  }

  return [...setA].every((item) => setB.has(item));
}

async function findMatchingPendingHomeHelpRequest(
  participantRef,
  requestedHelpTypes,
  languages
) {
  let pendingSnapshot = await getDocs(
    query(
      collection(db, "homeHelpRequests"),
      where("participant_ref", "==", participantRef),
      where("status", "==", "pending")
    )
  );

  if (pendingSnapshot.empty && participantRef) {
    pendingSnapshot = await getDocs(
      query(
        collection(db, "homeHelpRequests"),
        where(
          "participant_ref",
          "==",
          doc(db, "participants", participantRef)
        ),
        where("status", "==", "pending")
      )
    );
  }

  return pendingSnapshot.docs.find((requestDoc) => {
    const requestData = requestDoc.data();
    const existingHelpTypes =
      requestData.requestedHelpTypes ?? requestData.requestedServices ?? [];

    return (
      arraysMatchAsSets(existingHelpTypes, requestedHelpTypes) &&
      arraysMatchAsSets(requestData.languages, languages)
    );
  });
}

async function createHomeHelpRequestFromSubscription(subscription) {
  const participantDocId = await resolveParticipantDocId(
    subscription.participant_ref
  );
  const requestedHelpTypes = getSubscriptionRequestedHelpTypes(subscription);
  const languages = cleanStringArray(subscription.languages);

  if (!participantDocId) {
    return null;
  }

  if (requestedHelpTypes.length === 0 || languages.length === 0) {
    return null;
  }

  const existingRequest = await findMatchingPendingHomeHelpRequest(
    participantDocId,
    requestedHelpTypes,
    languages
  );

  if (existingRequest) {
    return null;
  }

  const description =
    subscription.description?.trim() ||
    subscription.otherService?.trim() ||
    "";

  const requestRef = await addDoc(collection(db, "homeHelpRequests"), {
    participant_ref: participantDocId,
    requestedHelpTypes,
    languages,
    description,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return requestRef.id;
}

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

  const fullName = formData.participantName.trim();
  const nameSeparatorIndex = fullName.indexOf(" ");
  const participantPayload = {
    id_number: formData.participantId,
    first_name:
      nameSeparatorIndex === -1
        ? fullName
        : fullName.slice(0, nameSeparatorIndex),
    last_name:
      nameSeparatorIndex === -1 ? "" : fullName.slice(nameSeparatorIndex + 1).trim(),
    phone: formData.phone,
    address: formData.address,
  };

  const participantsQuery = query(
    collection(db, "participants"),
    where("id_number", "==", formData.participantId)
  );

  const participantsSnapshot = await getDocs(participantsQuery);

  if (!participantsSnapshot.empty) {
    participantDocId = participantsSnapshot.docs[0].id;
    await updateDoc(
      doc(db, "participants", participantDocId),
      participantPayload
    );
  } else {
    const participantRef = await addDoc(collection(db, "participants"), {
      ...participantPayload,
      createdAt: serverTimestamp(),
    });

    participantDocId = participantRef.id;
  }

  const subscriptionPayload = {
    participant_ref: participantDocId,
    requestedServices: cleanStringArray(formData.services),
    otherService: formData.otherService?.trim() || "",
    languages: cleanStringArray(formData.languages),
    status: "pending",
  };

  const pendingSubscriptionQuery = query(
    collection(db, "communitySubscriptions"),
    where("participant_ref", "==", participantDocId),
    where("status", "==", "pending")
  );

  const pendingSubscriptionSnapshot = await getDocs(pendingSubscriptionQuery);

  if (!pendingSubscriptionSnapshot.empty) {
    await updateDoc(
      doc(
        db,
        "communitySubscriptions",
        pendingSubscriptionSnapshot.docs[0].id
      ),
      subscriptionPayload
    );
  } else {
    await addDoc(collection(db, "communitySubscriptions"), {
      ...subscriptionPayload,
      createdAt: serverTimestamp(),
    });
  }
};

function normalizeIdNumber(value) {
  return String(value ?? "").trim();
}

function normalizePhone(value) {
  return String(value ?? "").trim();
}

function phonesMatch(storedPhone, enteredPhone) {
  return normalizePhone(storedPhone) === normalizePhone(enteredPhone);
}

function isActiveSubscriptionStatus(status) {
  return String(status ?? "").trim().toLowerCase() === "active";
}

export const checkCommunityMembership = async (participantId, phone) => {
  const enteredIdNumber = normalizeIdNumber(participantId);
  const enteredPhone = normalizePhone(phone);

  console.log("entered ID number:", enteredIdNumber);
  console.log("entered phone number:", enteredPhone);

  let participantsSnapshot = await getDocs(
    query(
      collection(db, "participants"),
      where("id_number", "==", enteredIdNumber)
    )
  );

  if (participantsSnapshot.empty && /^\d+$/.test(enteredIdNumber)) {
    participantsSnapshot = await getDocs(
      query(
        collection(db, "participants"),
        where("id_number", "==", Number(enteredIdNumber))
      )
    );
  }

  if (participantsSnapshot.empty) {
    console.log("participant found/not found:", "not found");
    return {
      exists: false,
      message: "לא נמצא משתתף עם הפרטים שהוזנו",
    };
  }

  const matchingParticipant = participantsSnapshot.docs.find((participantDoc) =>
    phonesMatch(participantDoc.data().phone, enteredPhone)
  );

  if (!matchingParticipant) {
    console.log("participant found/not found:", "found but phone mismatch");
    return {
      exists: false,
      message: "לא נמצא משתתף עם הפרטים שהוזנו",
    };
  }

  console.log("participant found/not found:", "found");

  const participantDocId = matchingParticipant.id;
  console.log("participant document ID:", participantDocId);

  let subscriptionSnapshot = await getDocs(
    query(
      collection(db, "communitySubscriptions"),
      where("participant_ref", "==", participantDocId)
    )
  );

  if (subscriptionSnapshot.empty) {
    subscriptionSnapshot = await getDocs(
      query(
        collection(db, "communitySubscriptions"),
        where(
          "participant_ref",
          "==",
          doc(db, "participants", participantDocId)
        )
      )
    );
  }

  console.log(
    "matching communitySubscriptions documents found:",
    subscriptionSnapshot.docs.map((subscriptionDoc) => subscriptionDoc.id)
  );
  console.log(
    "status values found:",
    subscriptionSnapshot.docs.map(
      (subscriptionDoc) => subscriptionDoc.data().status
    )
  );

  const activeSubscription = subscriptionSnapshot.docs.find((subscriptionDoc) =>
    isActiveSubscriptionStatus(subscriptionDoc.data().status)
  );

  if (!activeSubscription) {
    return {
      exists: false,
      message: "לא נמצאה חברות פעילה בקהילה תומכת",
    };
  }

  return {
    exists: true,
    participantDocId,
    subscriptionDocId: activeSubscription.id,
    participantData: matchingParticipant.data(),
    subscriptionData: activeSubscription.data(),
  };
};

export const syncActiveCommunitySubscriptionsToHomeHelpRequests = async () => {
  const activeSubscriptionsSnapshot = await getDocs(
    query(
      collection(db, "communitySubscriptions"),
      where("status", "==", "active")
    )
  );

  let checkedCount = 0;
  let createdCount = 0;

  for (const subscriptionDoc of activeSubscriptionsSnapshot.docs) {
    checkedCount += 1;

    const homeHelpRequestId = await createHomeHelpRequestFromSubscription(
      subscriptionDoc.data()
    );

    if (homeHelpRequestId) {
      createdCount += 1;
    }
  }

  console.log("Active communitySubscriptions checked:", checkedCount);
  console.log("homeHelpRequests created:", createdCount);

  return { checkedCount, createdCount };
};

export const activateCommunitySubscription = async (subscriptionId) => {
  const subscriptionRef = doc(db, "communitySubscriptions", subscriptionId);
  const subscriptionSnapshot = await getDoc(subscriptionRef);

  if (!subscriptionSnapshot.exists()) {
    throw new Error("Subscription not found");
  }

  const subscription = subscriptionSnapshot.data();
  const previousStatus = String(subscription.status ?? "")
    .trim()
    .toLowerCase();

  if (previousStatus === "active") {
    return { homeHelpRequestCreated: false };
  }

  await updateDoc(subscriptionRef, { status: "active" });

  const homeHelpRequestId =
    await createHomeHelpRequestFromSubscription(subscription);

  return {
    homeHelpRequestCreated: Boolean(homeHelpRequestId),
    homeHelpRequestId: homeHelpRequestId || null,
  };
};

export const saveHomeHelpRequest = async (requestData) => {
  const participantDocId = await resolveParticipantDocId(
    requestData.participantDocId
  );

  if (!participantDocId) {
    throw new Error("Participant document not found");
  }

  const requestedHelpTypes = cleanStringArray(requestData.services);
  const languages = cleanStringArray(requestData.languages);
  const description = requestData.description?.trim() || "";

  const subscriptionRef = doc(
    db,
    "communitySubscriptions",
    requestData.subscriptionDocId
  );
  const subscriptionSnapshot = await getDoc(subscriptionRef);

  if (subscriptionSnapshot.exists()) {
    const existingSubscription = subscriptionSnapshot.data();

    await updateDoc(subscriptionRef, {
      requestedServices: mergeUniqueStringArrays(
        existingSubscription.requestedServices,
        requestedHelpTypes
      ),
      languages: mergeUniqueStringArrays(
        existingSubscription.languages,
        languages
      ),
    });
  }

  const existingHomeHelpRequest =
    await findHomeHelpRequestByParticipantRef(participantDocId);

  if (existingHomeHelpRequest) {
    const existingRequestData = existingHomeHelpRequest.data();

    await updateDoc(existingHomeHelpRequest.ref, {
      requestedHelpTypes: mergeUniqueStringArrays(
        existingRequestData.requestedHelpTypes ??
          existingRequestData.requestedServices,
        requestedHelpTypes
      ),
      languages: mergeUniqueStringArrays(
        existingRequestData.languages,
        languages
      ),
      description: mergeDescription(
        existingRequestData.description,
        description
      ),
      status: "pending",
    });

    return;
  }

  await addDoc(collection(db, "homeHelpRequests"), {
    participant_ref: participantDocId,
    requestedHelpTypes,
    languages,
    description,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};
