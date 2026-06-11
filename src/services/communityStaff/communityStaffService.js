import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
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
      data.name || data.label || data.displayName || helpTypeDoc.id;
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

function getArrayIntersection(arrayA, arrayB) {
  const normalizedA = normalizeStringArray(arrayA);
  const normalizedB = normalizeStringArray(arrayB);
  const setB = new Set(normalizedB);

  return normalizedA.filter((item) => setB.has(item));
}

function getParticipantFullName(participant) {
  if (!participant) return "—";

  const firstName = participant.first_name || participant.firstName || "";
  const lastName = participant.last_name || participant.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "—";
}

function isActiveVolunteer(volunteer) {
  return volunteer.status === "active" || volunteer.is_active === true;
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
        id: subscriptionDoc.id,
        ...subscriptionDoc.data(),
      };

      let participant = null;

      if (subscription.participant_ref) {
        const participantRef = doc(db, "participants", subscription.participant_ref);
        const participantSnap = await getDoc(participantRef);

        if (participantSnap.exists()) {
          participant = {
            id: participantSnap.id,
            ...participantSnap.data(),
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

function getVolunteerFullName(volunteer) {
  const firstName = volunteer.firstName || volunteer.first_name || "";
  const lastName = volunteer.lastName || volunteer.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "—";
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
  await updateDoc(volunteerRef, { status: "active" });
}

export async function getPendingHomeHelpRequests() {
  const requestsRef = collection(db, "homeHelpRequests");
  const pendingQuery = query(requestsRef, where("status", "==", "pending"));
  const snapshot = await getDocs(pendingQuery);

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
      };
    })
  );

  return requests;
}

async function loadActiveVolunteers() {
  const volunteersRef = collection(db, "volunteers");
  const [activeStatusSnapshot, activeFlagSnapshot] = await Promise.all([
    getDocs(query(volunteersRef, where("status", "==", "active"))),
    getDocs(query(volunteersRef, where("is_active", "==", true))),
  ]);

  const volunteersMap = new Map();

  [...activeStatusSnapshot.docs, ...activeFlagSnapshot.docs].forEach(
    (volunteerDoc) => {
      const volunteerData = volunteerDoc.data();
      volunteersMap.set(volunteerDoc.id, {
        id: volunteerDoc.id,
        ...volunteerData,
        volunteerId: volunteerData.volunteerId ?? volunteerDoc.id,
      });
    }
  );

  return Array.from(volunteersMap.values()).filter(isActiveVolunteer);
}

// Match using ONLY homeHelpRequests.requestedServices + homeHelpRequests.languages
// against volunteers.help_types + volunteers.languages
export async function getSuggestedVolunteersForRequest(helpRequest) {
  console.log("help request:", helpRequest);
  console.log("request services:", helpRequest.requestedServices);
  console.log("request languages:", helpRequest.languages);

  const [activeVolunteers, languageLookup, helpTypesLookup] = await Promise.all([
    loadActiveVolunteers(),
    loadLanguageLookup(),
    loadHelpTypesLookup(),
  ]);

  console.log("active volunteers:", activeVolunteers);

  const requestServices = Array.isArray(helpRequest.requestedServices)
    ? helpRequest.requestedServices
    : [];
  const requestLanguages = Array.isArray(helpRequest.languages)
    ? helpRequest.languages
    : [];

  return activeVolunteers
    .map((volunteer) => {
      console.log("checking volunteer:", volunteer);
      console.log("volunteer help types:", volunteer.help_types);
      console.log("volunteer languages:", volunteer.languages);

      const volunteerHelpTypes = Array.isArray(volunteer.help_types)
        ? volunteer.help_types
        : [];
      const volunteerLanguages = Array.isArray(volunteer.languages)
        ? volunteer.languages
        : [];

      const volunteerHelpTypesForMatching = volunteerHelpTypes.map(
        (helpType) =>
          helpTypesLookup.get(String(helpType).trim()) ||
          String(helpType).trim()
      );
      const volunteerLanguagesForMatching = volunteerLanguages.map(
        (language) =>
          languageLookup.get(String(language).trim()) ||
          String(language).trim()
      );

      const matchingServices = getArrayIntersection(
        requestServices,
        volunteerHelpTypesForMatching
      );
      const matchingLanguages = getArrayIntersection(
        requestLanguages,
        volunteerLanguagesForMatching
      );

      console.log("matching services:", matchingServices);
      console.log("matching languages:", matchingLanguages);

      if (matchingServices.length === 0 || matchingLanguages.length === 0) {
        return null;
      }

      return {
        volunteerId: volunteer.volunteerId,
        fullNameDisplay: getVolunteerFullName(volunteer),
        phone: volunteer.phone || "—",
        matchingHelpTypes: matchingServices,
        matchingLanguages,
      };
    })
    .filter(Boolean);
}

// Save match only in volunteerMatches; update homeHelpRequests.status only
export async function approveHelpRequestMatch(helpRequest, volunteer) {
  await addDoc(collection(db, "volunteerMatches"), {
    requestId: helpRequest.id,
    participantId: helpRequest.participant_ref,
    volunteerId: volunteer.volunteerId,
    matchedAt: serverTimestamp(),
    matchedByStaffId: "",
    status: "matched",
    notes: "",
  });

  const requestRef = doc(db, "homeHelpRequests", helpRequest.id);
  await updateDoc(requestRef, { status: "matched" });
}
