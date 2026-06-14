import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";

async function loadLanguageLookup() {
  const snapshot = await getDocs(collection(db, "languages"));
  const lookup = new Map();

  snapshot.docs.forEach((languageDoc) => {
    const data = languageDoc.data();
    const label =
      data.name || data.label || data.displayName || languageDoc.id;
    lookup.set(languageDoc.id, label);
  });

  return lookup;
}

async function loadHelpTypesLookup() {
  const snapshot = await getDocs(collection(db, "helpTypes"));
  const lookup = new Map();

  snapshot.docs.forEach((helpTypeDoc) => {
    const data = helpTypeDoc.data();
    const label =
      data.help_name || data.name || data.label || data.displayName || helpTypeDoc.id;
    lookup.set(helpTypeDoc.id, label);
  });

  return lookup;
}

function resolveIdList(ids, lookup) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return "—";
  }

  const names = ids
    .filter(Boolean)
    .map((id) => lookup.get(id) || id);

  return names.length > 0 ? names.join(", ") : "—";
}

function resolveLanguageNames(languageIds, languageLookup) {
  return resolveIdList(languageIds, languageLookup);
}

function resolveServiceNames(serviceIds, helpTypesLookup) {
  return resolveIdList(serviceIds, helpTypesLookup);
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

function mergeUniqueStringArrays(existingValues, newValues) {
  return normalizeStringArray([
    ...(Array.isArray(existingValues) ? existingValues : []),
    ...normalizeStringArray(newValues),
  ]);
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

function getArrayIntersection(arrayA, arrayB) {
  const normalizedA = normalizeStringArray(arrayA);
  const normalizedB = normalizeStringArray(arrayB);
  const setB = new Set(normalizedB);

  return normalizedA.filter((item) => setB.has(item));
}

function resolveIdArrayToLabels(ids, lookup) {
  return normalizeStringArray(ids).map((id) => lookup.get(id) || id);
}

function getRequestHelpTypes(helpRequest) {
  return normalizeStringArray(helpRequest.requestedHelpTypes);
}

function getVolunteerHelpTypes(volunteer) {
  return normalizeStringArray(volunteer.help_types);
}

function getParticipantFullName(participant) {
  if (!participant) return "—";

  const firstName = participant.first_name || participant.firstName || "";
  const lastName = participant.last_name || participant.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "—";
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

export async function getPendingCommunityJoinRequests() {
  const subscriptionsRef = collection(db, "communitySubscriptions");
  const pendingQuery = query(subscriptionsRef, where("status", "==", "pending"));
  const snapshot = await getDocs(pendingQuery);
  const [languageLookup, helpTypesLookup] = await Promise.all([
    loadLanguageLookup(),
    loadHelpTypesLookup(),
  ]);

  const requests = await Promise.all(
    snapshot.docs.map(async (subscriptionDoc) => {
      const subscription = {
        ...subscriptionDoc.data(),
        id: subscriptionDoc.id,
      };

      let participant = null;
      const participantDocId = getParticipantRefId(subscription.participant_ref);

      if (participantDocId) {
        const participantSnap = await getDoc(
          doc(db, "participants", participantDocId)
        );

        if (participantSnap.exists()) {
          participant = {
            ...participantSnap.data(),
            id: participantSnap.id,
          };
        }
      }

      return {
        ...subscription,
        participant,
        languagesDisplay: resolveLanguageNames(
          subscription.languages,
          languageLookup
        ),
        requestedServicesDisplay: resolveServiceNames(
          subscription.requestedServices,
          helpTypesLookup
        ),
      };
    })
  );

  return requests;
}

function parseBirthDateForFirestore(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && typeof value.toDate === "function") {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Timestamp.fromDate(date);
}

function parseMonthlyPrice(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const price = parseFloat(value);

  if (Number.isNaN(price) || price < 0) {
    throw new Error("Invalid monthly price");
  }

  return price;
}

function buildSubscriptionUpdatePayload(subscriptionData) {
  return {
    monthlyPrice: parseMonthlyPrice(subscriptionData.monthlyPrice),
    requestedServices: normalizeStringArray(subscriptionData.requestedServices),
    languages: normalizeStringArray(subscriptionData.languages),
    otherService: subscriptionData.otherService?.trim() || "",
  };
}

export async function completeCommunityJoinRegistration({
  subscriptionId,
  participantDocId,
  participantData,
  subscriptionData = {},
}) {
  if (!subscriptionId) {
    throw new Error("Missing communitySubscriptions document id");
  }

  if (!participantDocId) {
    throw new Error("Missing participant document id");
  }

  const subscriptionRef = doc(db, "communitySubscriptions", subscriptionId);
  const subscriptionSnapshot = await getDoc(subscriptionRef);

  if (!subscriptionSnapshot.exists()) {
    throw new Error(
      `communitySubscriptions document not found: ${subscriptionId}`
    );
  }

  const subscriptionFields = buildSubscriptionUpdatePayload(subscriptionData);
  const requestedHelpTypes = subscriptionFields.requestedServices;
  const languages = subscriptionFields.languages;
  const description = subscriptionFields.otherService;

  await updateDoc(doc(db, "participants", participantDocId), {
    first_name: participantData.first_name?.trim() || "",
    last_name: participantData.last_name?.trim() || "",
    id_number: participantData.id_number?.trim() || "",
    phone: participantData.phone?.trim() || "",
    birth_date: parseBirthDateForFirestore(participantData.birth_date),
    gender: participantData.gender || "",
    address: participantData.address?.trim() || "",
    emergency_number: participantData.emergency_number?.trim() || "",
    medical_notes: participantData.medical_notes?.trim() || "",
    mobility_limitations: participantData.mobility_limitations?.trim() || "",
    marketing_consent: Boolean(participantData.marketing_consent),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(subscriptionRef, {
    ...subscriptionFields,
    status: "active",
    updatedAt: serverTimestamp(),
  });

  const existingHomeHelpRequest =
    await findHomeHelpRequestByParticipantRef(participantDocId);

  let homeHelpRequestId;

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

    homeHelpRequestId = existingHomeHelpRequest.id;
  } else {
    const homeHelpRequestRef = await addDoc(collection(db, "homeHelpRequests"), {
      createdAt: serverTimestamp(),
      description,
      languages,
      participant_ref: participantDocId,
      requestedHelpTypes,
      status: "pending",
    });

    homeHelpRequestId = homeHelpRequestRef.id;
  }

  return {
    subscriptionId,
    participantDocId,
    homeHelpRequestId,
  };
}

function getVolunteerFullName(volunteer) {
  const firstName = volunteer.first_name || volunteer.firstName || "";
  const lastName = volunteer.last_name || volunteer.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "—";
}

export function isStaffActiveVolunteer(volunteer) {
  return volunteer?.status === "active" && volunteer?.is_active === true;
}

export function isStaffInactiveVolunteer(volunteer) {
  return volunteer?.status === "inactive" && volunteer?.is_active === false;
}

function getVolunteerActiveStatusLabel(volunteer) {
  if (isStaffActiveVolunteer(volunteer)) {
    return "פעיל";
  }

  if (isStaffInactiveVolunteer(volunteer)) {
    return "לא פעיל";
  }

  if (volunteer?.status === "pending") {
    return "ממתין";
  }

  return volunteer?.status || "—";
}

export async function getPendingVolunteerRequests() {
  const volunteersRef = collection(db, "volunteers");
  const pendingQuery = query(volunteersRef, where("status", "==", "pending"));
  const snapshot = await getDocs(pendingQuery);
  const languageLookup = await loadLanguageLookup();

  return snapshot.docs.map((volunteerDoc) => {
    const volunteer = {
      id: volunteerDoc.id,
      ...volunteerDoc.data(),
    };

    return {
      ...volunteer,
      fullNameDisplay: getVolunteerFullName(volunteer),
      languagesDisplay: resolveLanguageNames(volunteer.languages, languageLookup),
    };
  });
}

export async function approveVolunteer(volunteerId) {
  const volunteerRef = doc(db, "volunteers", volunteerId);
  await updateDoc(volunteerRef, {
    is_active: true,
    status: "active",
  });
}

export async function getPendingHomeHelpRequests() {
  const requestsRef = collection(db, "homeHelpRequests");
  const pendingQuery = query(requestsRef, where("status", "==", "pending"));
  const [languageLookup, snapshot] = await Promise.all([
    loadLanguageLookup(),
    getDocs(pendingQuery),
  ]);

  const requests = await Promise.all(
    snapshot.docs.map(async (requestDoc) => {
      const helpRequest = {
        id: requestDoc.id,
        ...requestDoc.data(),
      };

      let participant = null;

      if (helpRequest.participant_ref) {
        const participantRef = doc(
          db,
          "participants",
          helpRequest.participant_ref
        );
        const participantSnap = await getDoc(participantRef);

        if (participantSnap.exists()) {
          participant = {
            id: participantSnap.id,
            ...participantSnap.data(),
          };
        }
      }

      return {
        ...helpRequest,
        participant,
        participantFullName: getParticipantFullName(participant),
        participantIdNumber: participant?.id_number || "—",
        participantPhone: participant?.phone || "—",
        languagesDisplay: resolveLanguageNames(
          helpRequest.languages,
          languageLookup
        ),
      };
    })
  );

  return requests;
}

async function loadActiveVolunteers() {
  const volunteersRef = collection(db, "volunteers");
  const activeSnapshot = await getDocs(
    query(
      volunteersRef,
      where("status", "==", "active"),
      where("is_active", "==", true)
    )
  );

  return activeSnapshot.docs.map((volunteerDoc) => {
    const volunteerData = volunteerDoc.data();

    return {
      id: volunteerDoc.id,
      ...volunteerData,
      volunteerId: volunteerData.volunteerId ?? volunteerDoc.id,
    };
  });
}

export async function getSuggestedVolunteersForRequest(helpRequest) {
  const [activeVolunteers, languageLookup, helpTypesLookup] = await Promise.all([
    loadActiveVolunteers(),
    loadLanguageLookup(),
    loadHelpTypesLookup(),
  ]);

  const requestHelpTypes = getRequestHelpTypes(helpRequest);
  const requestLanguages = normalizeStringArray(helpRequest.languages);

  const matches = activeVolunteers
    .map((volunteer) => {
      const volunteerHelpTypes = getVolunteerHelpTypes(volunteer);
      const volunteerLanguages = normalizeStringArray(volunteer.languages);

      const matchedLanguageIds = getArrayIntersection(
        requestLanguages,
        volunteerLanguages
      );

      if (matchedLanguageIds.length === 0) {
        return null;
      }

      const matchedHelpTypeIds = getArrayIntersection(
        requestHelpTypes,
        volunteerHelpTypes
      );
      const matchScore = matchedHelpTypeIds.length;

      if (matchScore === 0) {
        return null;
      }

      const matchedLanguages = resolveIdArrayToLabels(
        matchedLanguageIds,
        languageLookup
      );
      const matchedHelpTypes = resolveIdArrayToLabels(
        matchedHelpTypeIds,
        helpTypesLookup
      );

      return {
        volunteer,
        volunteerId: volunteer.volunteerId,
        volunteerRef: volunteer.id,
        fullNameDisplay: getVolunteerFullName(volunteer),
        phone: volunteer.phone || "—",
        matchScore,
        matchedLanguageIds,
        matchedHelpTypeIds,
        matchedLanguages,
        matchedHelpTypes,
        matchingHelpTypes: matchedHelpTypes,
        matchingLanguages: matchedLanguages,
      };
    })
    .filter(Boolean);

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

async function findExistingVolunteerMatch(requestId, volunteerRef) {
  const matchesRef = collection(db, "volunteerMatches");
  const snapshot = await getDocs(
    query(
      matchesRef,
      where("requestId", "==", requestId),
      where("volunteer_ref", "==", volunteerRef)
    )
  );

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0];
}

function getVolunteerRefId(volunteerMatch) {
  return (
    volunteerMatch.volunteerRef ||
    volunteerMatch.volunteer?.id ||
    volunteerMatch.volunteerId ||
    volunteerMatch.volunteer?.volunteerId ||
    ""
  );
}

// Save match only in volunteerMatches; update homeHelpRequests.status only
export async function approveHelpRequestMatch(helpRequest, volunteerMatch) {
  const requestId = helpRequest.id;
  const participantRef = getParticipantRefId(helpRequest.participant_ref);
  const volunteerRef = getVolunteerRefId(volunteerMatch);

  const matchData = {
    matchScore: Number(volunteerMatch.matchScore) || 0,
    matchedAt: serverTimestamp(),
    matchedByStaffId: "",
    matchedHelpTypes: normalizeStringArray(
      volunteerMatch.matchedHelpTypeIds ?? volunteerMatch.matchedHelpTypes
    ),
    matchedLanguages: normalizeStringArray(
      volunteerMatch.matchedLanguageIds ?? volunteerMatch.matchedLanguages
    ),
    notes: "",
    participant_ref: participantRef,
    requestId,
    status: "matched",
    volunteer_ref: volunteerRef,
  };

  const existingMatch = await findExistingVolunteerMatch(requestId, volunteerRef);

  if (existingMatch) {
    await updateDoc(existingMatch.ref, matchData);
  } else {
    await addDoc(collection(db, "volunteerMatches"), matchData);
  }

  const requestRef = doc(db, "homeHelpRequests", requestId);
  await updateDoc(requestRef, { status: "matched" });
}

export async function getActiveVolunteerMatches() {
  const matchesRef = collection(db, "volunteerMatches");
  const matchedMatchesQuery = query(matchesRef, where("status", "==", "matched"));
  const [snapshot, languageLookup, helpTypesLookup] = await Promise.all([
    getDocs(matchedMatchesQuery),
    loadLanguageLookup(),
    loadHelpTypesLookup(),
  ]);

  const matches = await Promise.all(
    snapshot.docs.map(async (matchDoc) => {
      const match = {
        id: matchDoc.id,
        ...matchDoc.data(),
      };
      const participantDocId = getParticipantRefId(match.participant_ref);
      const volunteerDocId = String(match.volunteer_ref || "").trim();

      const [participantSnap, volunteerSnap, requestSnap] = await Promise.all([
        participantDocId
          ? getDoc(doc(db, "participants", participantDocId))
          : Promise.resolve(null),
        volunteerDocId
          ? getDoc(doc(db, "volunteers", volunteerDocId))
          : Promise.resolve(null),
        match.requestId
          ? getDoc(doc(db, "homeHelpRequests", match.requestId))
          : Promise.resolve(null),
      ]);

      const participant =
        participantSnap?.exists()
          ? { id: participantSnap.id, ...participantSnap.data() }
          : null;
      const volunteer =
        volunteerSnap?.exists()
          ? { id: volunteerSnap.id, ...volunteerSnap.data() }
          : null;
      const helpRequest =
        requestSnap?.exists()
          ? { id: requestSnap.id, ...requestSnap.data() }
          : null;

      return {
        ...match,
        matchedAtDisplay: formatFirestoreTimestamp(match.matchedAt),
        matchedLanguagesDisplay: resolveLanguageNames(
          match.matchedLanguages,
          languageLookup
        ),
        matchedHelpTypesDisplay: resolveIdList(
          match.matchedHelpTypes,
          helpTypesLookup
        ),
        notesDisplay: match.notes?.trim() || "—",
        participant,
        participantDocId,
        participantFullName: getParticipantFullName(participant),
        participantPhone: participant?.phone || "—",
        participantIdNumber: participant?.id_number || "—",
        volunteer,
        volunteerDocId,
        volunteerFullName: getVolunteerFullName(volunteer),
        volunteerPhone: volunteer?.phone || "—",
        volunteerIsActive: isStaffActiveVolunteer(volunteer),
        volunteerIsActiveDisplay: getVolunteerActiveStatusLabel(volunteer),
        helpRequest,
        helpRequestDescription: helpRequest?.description || "—",
        helpRequestStatus: helpRequest?.status || "—",
        helpRequestLanguagesDisplay: resolveLanguageNames(
          helpRequest?.languages,
          languageLookup
        ),
        helpRequestHelpTypesDisplay: resolveIdList(
          helpRequest?.requestedHelpTypes,
          helpTypesLookup
        ),
        helpRequestCreatedAtDisplay: formatFirestoreTimestamp(
          helpRequest?.createdAt
        ),
      };
    })
  );

  return matches.sort((a, b) => {
    const aTime =
      typeof a.matchedAt?.toMillis === "function" ? a.matchedAt.toMillis() : 0;
    const bTime =
      typeof b.matchedAt?.toMillis === "function" ? b.matchedAt.toMillis() : 0;

    return bTime - aTime;
  });
}

export async function updateVolunteerMatchNotes(matchId, notes) {
  if (!matchId) {
    throw new Error("Missing volunteerMatches document id");
  }

  await updateDoc(doc(db, "volunteerMatches", matchId), {
    notes: notes?.trim() || "",
  });
}

function formatFirestoreTimestamp(timestamp) {
  if (!timestamp) {
    return "—";
  }

  const date =
    typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : timestamp instanceof Date
        ? timestamp
        : null;

  if (!date) {
    return "—";
  }

  return date.toLocaleString("he-IL");
}

function formatMonthlyPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return `₪${value.toLocaleString("he-IL")}`;
  }

  return String(value);
}

async function getHomeHelpRequestsForParticipant(participantDocId) {
  if (!participantDocId) {
    return [];
  }

  const requestsRef = collection(db, "homeHelpRequests");
  const [stringQuerySnapshot, refQuerySnapshot] = await Promise.all([
    getDocs(
      query(requestsRef, where("participant_ref", "==", participantDocId))
    ),
    getDocs(
      query(
        requestsRef,
        where(
          "participant_ref",
          "==",
          doc(db, "participants", participantDocId)
        )
      )
    ),
  ]);

  const requestsMap = new Map();

  [...stringQuerySnapshot.docs, ...refQuerySnapshot.docs].forEach(
    (requestDoc) => {
      requestsMap.set(requestDoc.id, {
        id: requestDoc.id,
        ...requestDoc.data(),
      });
    }
  );

  return Array.from(requestsMap.values());
}

export async function getCommunityMembers() {
  const subscriptionsRef = collection(db, "communitySubscriptions");
  const membersQuery = query(
    subscriptionsRef,
    where("status", "in", ["active", "inactive"])
  );
  const [snapshot, languageLookup, helpTypesLookup] = await Promise.all([
    getDocs(membersQuery),
    loadLanguageLookup(),
    loadHelpTypesLookup(),
  ]);

  const members = await Promise.all(
    snapshot.docs.map(async (subscriptionDoc) => {
      const subscription = {
        id: subscriptionDoc.id,
        ...subscriptionDoc.data(),
      };
      const participantDocId = getParticipantRefId(subscription.participant_ref);
      let participant = null;

      if (participantDocId) {
        const participantSnap = await getDoc(
          doc(db, "participants", participantDocId)
        );

        if (participantSnap.exists()) {
          participant = {
            id: participantSnap.id,
            ...participantSnap.data(),
          };
        }
      }

      const requestedServicesDisplay = resolveServiceNames(
        subscription.requestedServices,
        helpTypesLookup
      );
      const servicesDisplay =
        subscription.otherService && requestedServicesDisplay !== "—"
          ? `${requestedServicesDisplay}, ${subscription.otherService}`
          : subscription.otherService || requestedServicesDisplay;

      return {
        ...subscription,
        participant,
        participantDocId,
        fullNameDisplay: getParticipantFullName(participant),
        phone: participant?.phone || "—",
        idNumberDisplay: participant?.id_number || "—",
        languagesDisplay: resolveLanguageNames(
          subscription.languages,
          languageLookup
        ),
        requestedServicesDisplay: servicesDisplay,
        monthlyPriceDisplay: formatMonthlyPrice(subscription.monthlyPrice),
      };
    })
  );

  return members.sort((a, b) =>
    a.fullNameDisplay.localeCompare(b.fullNameDisplay, "he")
  );
}

export async function updateCommunityMemberSubscriptionStatus(
  subscriptionId,
  status
) {
  if (status !== "active" && status !== "inactive") {
    throw new Error("Invalid subscription status");
  }

  await updateDoc(doc(db, "communitySubscriptions", subscriptionId), {
    status,
  });
}

export async function updateCommunityMemberParticipant(
  participantDocId,
  participantData
) {
  if (!participantDocId) {
    throw new Error("Missing participant document id");
  }

  await updateDoc(doc(db, "participants", participantDocId), {
    address: participantData.address?.trim() || "",
    birth_date: parseBirthDateForFirestore(participantData.birth_date),
    emergency_number: participantData.emergency_number?.trim() || "",
    first_name: participantData.first_name?.trim() || "",
    gender: participantData.gender || "",
    id_number: participantData.id_number?.trim() || "",
    last_name: participantData.last_name?.trim() || "",
    marketing_consent: Boolean(participantData.marketing_consent),
    medical_notes: participantData.medical_notes?.trim() || "",
    mobility_limitations: participantData.mobility_limitations?.trim() || "",
    phone: participantData.phone?.trim() || "",
  });
}

export async function updateCommunityMemberSubscription(
  subscriptionId,
  subscriptionData
) {
  if (!subscriptionId) {
    throw new Error("Missing communitySubscriptions document id");
  }

  await updateDoc(doc(db, "communitySubscriptions", subscriptionId), {
    ...buildSubscriptionUpdatePayload(subscriptionData),
    updatedAt: serverTimestamp(),
  });
}

export async function getCommunityMemberHomeHelpRequests(participantDocId) {
  const [requests, languageLookup, helpTypesLookup] = await Promise.all([
    getHomeHelpRequestsForParticipant(participantDocId),
    loadLanguageLookup(),
    loadHelpTypesLookup(),
  ]);

  return requests
    .map((request) => ({
      id: request.id,
      createdAt: request.createdAt,
      createdAtDisplay: formatFirestoreTimestamp(request.createdAt),
      description: request.description || "—",
      languagesDisplay: resolveLanguageNames(request.languages, languageLookup),
      requestedHelpTypesDisplay: resolveIdList(
        request.requestedHelpTypes ?? request.requestedServices,
        helpTypesLookup
      ),
      status: request.status || "—",
    }))
    .sort((a, b) => {
      const aTime =
        typeof a.createdAt?.toMillis === "function" ? a.createdAt.toMillis() : 0;
      const bTime =
        typeof b.createdAt?.toMillis === "function" ? b.createdAt.toMillis() : 0;

      return bTime - aTime;
    });
}

function getVolunteerActiveStatusLabelForLegacy(isActive) {
  return isActive === true ? "פעיל" : "לא פעיל";
}

export async function getVolunteerManagementLookups() {
  const [languagesSnapshot, helpTypesSnapshot] = await Promise.all([
    getDocs(query(collection(db, "languages"), where("is_active", "==", true))),
    getDocs(query(collection(db, "helpTypes"), where("is_active", "==", true))),
  ]);

  return {
    languages: languagesSnapshot.docs
      .map((languageDoc) => ({
        id: languageDoc.id,
        name: languageDoc.data().name || languageDoc.id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "he")),
    helpTypes: helpTypesSnapshot.docs
      .map((helpTypeDoc) => ({
        id: helpTypeDoc.id,
        help_name: helpTypeDoc.data().help_name || helpTypeDoc.id,
      }))
      .sort((a, b) => a.help_name.localeCompare(b.help_name, "he")),
  };
}

export async function getAllVolunteers() {
  const [snapshot, languageLookup, helpTypesLookup] = await Promise.all([
    getDocs(collection(db, "volunteers")),
    loadLanguageLookup(),
    loadHelpTypesLookup(),
  ]);

  return snapshot.docs
    .map((volunteerDoc) => {
      const volunteer = {
        id: volunteerDoc.id,
        ...volunteerDoc.data(),
        volunteerId: volunteerDoc.data().volunteerId ?? volunteerDoc.id,
      };

      return {
        ...volunteer,
        fullNameDisplay: getVolunteerFullName(volunteer),
        languagesDisplay: resolveLanguageNames(volunteer.languages, languageLookup),
        helpTypesDisplay: resolveIdList(volunteer.help_types, helpTypesLookup),
        activeStatusDisplay: getVolunteerActiveStatusLabel(volunteer.is_active),
        notesDisplay: volunteer.notes?.trim() || "—",
        emailDisplay: volunteer.email?.trim() || "—",
        addressDisplay: volunteer.address?.trim() || "—",
        phoneDisplay: volunteer.phone?.trim() || "—",
        searchFirstName: volunteer.first_name || volunteer.firstName || "",
        searchLastName: volunteer.last_name || volunteer.lastName || "",
        searchAddress: volunteer.address || "",
      };
    })
    .sort((a, b) => a.fullNameDisplay.localeCompare(b.fullNameDisplay, "he"));
}

export async function updateVolunteerActiveStatus(volunteerDocId, isActive) {
  if (!volunteerDocId) {
    throw new Error("Missing volunteer document id");
  }

  await updateDoc(doc(db, "volunteers", volunteerDocId), {
    is_active: Boolean(isActive),
  });
}

export async function updateVolunteerDetails(volunteerDocId, volunteerData) {
  if (!volunteerDocId) {
    throw new Error("Missing volunteer document id");
  }

  await updateDoc(doc(db, "volunteers", volunteerDocId), {
    address: volunteerData.address?.trim() || "",
    email: volunteerData.email?.trim() || "",
    first_name: volunteerData.first_name?.trim() || "",
    gender: volunteerData.gender || "",
    help_types: normalizeStringArray(volunteerData.help_types),
    languages: normalizeStringArray(volunteerData.languages),
    last_name: volunteerData.last_name?.trim() || "",
    notes: volunteerData.notes?.trim() || "",
    phone: volunteerData.phone?.trim() || "",
  });
}

export async function getCommunityStaffDashboardStats() {
  const [
    activeMembersSnapshot,
    activeVolunteersSnapshot,
    pendingJoinRequestsSnapshot,
    pendingHelpRequestsSnapshot,
    matchedMatchesSnapshot,
    allMatchesSnapshot,
  ] = await Promise.all([
    getDocs(
      query(
        collection(db, "communitySubscriptions"),
        where("status", "==", "active")
      )
    ),
    getDocs(
      query(
        collection(db, "volunteers"),
        where("status", "==", "active"),
        where("is_active", "==", true)
      )
    ),
    getDocs(
      query(
        collection(db, "communitySubscriptions"),
        where("status", "==", "pending")
      )
    ),
    getDocs(
      query(collection(db, "homeHelpRequests"), where("status", "==", "pending"))
    ),
    getDocs(
      query(collection(db, "volunteerMatches"), where("status", "==", "matched"))
    ),
    getDocs(collection(db, "volunteerMatches")),
  ]);

  const requestIdsWithMatches = new Set(
    allMatchesSnapshot.docs
      .map((matchDoc) => matchDoc.data().requestId)
      .filter(Boolean)
  );

  const unmatchedPendingRequests = pendingHelpRequestsSnapshot.docs.filter(
    (requestDoc) => !requestIdsWithMatches.has(requestDoc.id)
  ).length;

  return {
    activeCommunityMembers: activeMembersSnapshot.size,
    activeVolunteers: activeVolunteersSnapshot.size,
    pendingJoinRequests: pendingJoinRequestsSnapshot.size,
    pendingHelpRequests: pendingHelpRequestsSnapshot.size,
    activeMatches: matchedMatchesSnapshot.size,
    unmatchedPendingRequests,
  };
}
