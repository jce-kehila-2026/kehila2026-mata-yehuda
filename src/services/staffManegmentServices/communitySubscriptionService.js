import { db } from "../../config/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query
} from "firebase/firestore";
import { SUPPORTIVE_COMMUNITY_ID } from "../../utils/staffManegmentUtils/programConstants";
import { toSafeString } from "../../utils/staffManegmentUtils/participantStatusLabels";
import {
    filterActiveRecords,
    filterArchivedRecords
} from "../../utils/staffManegmentUtils/archiveUtils";
import {
    archiveDocument,
    permanentlyDeleteDocument,
    restoreDocument
} from "./archiveService";

/** Firestore collection for supportive community memberships. */
export const COMMUNITY_SUBSCRIPTIONS_COLLECTION = "communitySubscriptions";

const ADMIN_QUERY_LIMIT = 1000;

export const COMMUNITY_SUBSCRIPTION_SOURCE_TYPE = "community_subscription";

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

function splitFullName(fullName) {
    const trimmed = toSafeString(fullName);

    if (!trimmed) {
        return { first_name: "", last_name: "" };
    }

    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
        return { first_name: parts[0], last_name: "" };
    }

    return {
        first_name: parts[0],
        last_name: parts.slice(1).join(" ")
    };
}

function resolveRegistrationStatus(data) {
    const explicitStatus = toSafeString(
        data.registration_status || data.registrationStatus
    );

    if (explicitStatus) {
        return explicitStatus;
    }

    const subscriptionStatus = toSafeString(data.status).toLowerCase();

    if (subscriptionStatus === "pending") {
        return "waiting";
    }

    if (subscriptionStatus === "inactive") {
        return "cancelled";
    }

    return "registered";
}

function resolvePaymentStatus(data) {
    const paymentStatus = toSafeString(
        data.payment_status || data.paymentStatus
    );

    return paymentStatus || "unknown";
}

function resolveRegisteredAt(data) {
    return (
        data.created_at ||
        data.registration_date ||
        data.registrationDate ||
        data.createdAt ||
        data.registered_at ||
        data.registeredAt ||
        null
    );
}

function resolveNameFields(data, participant) {
    let first_name = toSafeString(
        data.first_name ||
            data.firstName ||
            participant?.first_name ||
            participant?.firstName
    );
    let last_name = toSafeString(
        data.last_name ||
            data.lastName ||
            participant?.last_name ||
            participant?.lastName
    );

    if (!first_name && !last_name) {
        const fullName =
            data.name ||
            data.fullName ||
            data.full_name ||
            data.participantName ||
            participant?.participantName;

        if (fullName) {
            const split = splitFullName(fullName);
            first_name = split.first_name;
            last_name = split.last_name;
        }
    }

    return { first_name, last_name };
}

/**
 * Maps a communitySubscriptions document (and optional linked participant)
 * to the admin participants table shape.
 */
export function normalizeCommunitySubscription(
    subscriptionId,
    data = {},
    participant = null
) {
    const participantDocId = getParticipantRefId(data.participant_ref);
    const { first_name, last_name } = resolveNameFields(data, participant);

    return {
        id: subscriptionId,
        first_name,
        last_name,
        phone: toSafeString(data.phone || participant?.phone),
        id_number: toSafeString(
            data.id_number ||
                data.idNumber ||
                participant?.id_number ||
                participant?.idNumber
        ),
        birth_date: participant?.birth_date || data.birth_date || null,
        gender: participant?.gender || data.gender || "",
        address: participant?.address || data.address || "",
        emergency_number:
            participant?.emergency_number || data.emergency_number || "",
        medical_notes: participant?.medical_notes || data.medical_notes || "",
        mobility_limitations:
            participant?.mobility_limitations || data.mobility_limitations || "",
        marketing_consent: Boolean(
            participant?.marketing_consent ?? data.marketing_consent
        ),
        program_id: SUPPORTIVE_COMMUNITY_ID,
        registration_status: resolveRegistrationStatus(data),
        payment_status: resolvePaymentStatus(data),
        registered_at: resolveRegisteredAt(data),
        participantDocId,
        participant_id: participantDocId,
        sourceType: COMMUNITY_SUBSCRIPTION_SOURCE_TYPE,
        subscriptionStatus: toSafeString(data.status),
        isArchived: data.isArchived === true,
        archivedAt: data.archivedAt || null
    };
}

export function getParticipantDocumentId(record) {
    if (!record) {
        return "";
    }

    if (record.sourceType === COMMUNITY_SUBSCRIPTION_SOURCE_TYPE) {
        return record.participantDocId || record.participant_id || "";
    }

    return record.id || "";
}

export function isCommunitySubscriptionRecord(record) {
    return record?.sourceType === COMMUNITY_SUBSCRIPTION_SOURCE_TYPE;
}

async function fetchParticipantById(participantDocId) {
    if (!participantDocId) {
        return null;
    }

    const participantSnap = await getDoc(
        doc(db, "participants", participantDocId)
    );

    if (!participantSnap.exists()) {
        return null;
    }

    return {
        id: participantSnap.id,
        ...participantSnap.data()
    };
}

async function mapSubscriptionDocsToAdminRecords(subscriptionRecords) {
    return Promise.all(
        subscriptionRecords.map(async (subscriptionRecord) => {
            const participantDocId = getParticipantRefId(
                subscriptionRecord.participant_ref
            );
            const participant = await fetchParticipantById(participantDocId);

            return normalizeCommunitySubscription(
                subscriptionRecord.id,
                subscriptionRecord,
                participant
            );
        })
    );
}

async function fetchAllCommunitySubscriptionDocs() {
    const snapshot = await getDocs(
        query(
            collection(db, COMMUNITY_SUBSCRIPTIONS_COLLECTION),
            limit(ADMIN_QUERY_LIMIT)
        )
    );

    return snapshot.docs.map((subscriptionDoc) => ({
        id: subscriptionDoc.id,
        ...subscriptionDoc.data()
    }));
}

export async function fetchCommunitySubscriptionsForAdminList() {
    const subscriptionRecords = filterActiveRecords(
        await fetchAllCommunitySubscriptionDocs()
    );

    return mapSubscriptionDocsToAdminRecords(subscriptionRecords);
}

export async function fetchArchivedCommunitySubscriptionsForAdminList() {
    const subscriptionRecords = filterArchivedRecords(
        await fetchAllCommunitySubscriptionDocs()
    );

    return mapSubscriptionDocsToAdminRecords(subscriptionRecords);
}

export async function countCommunitySubscriptionRecords() {
    const records = await fetchCommunitySubscriptionsForAdminList();
    return records.length;
}

export async function archiveCommunitySubscription(subscriptionId) {
    return archiveDocument(COMMUNITY_SUBSCRIPTIONS_COLLECTION, subscriptionId);
}

export async function restoreCommunitySubscription(subscriptionId) {
    return restoreDocument(COMMUNITY_SUBSCRIPTIONS_COLLECTION, subscriptionId);
}

export async function permanentlyDeleteCommunitySubscription(subscriptionId) {
    return permanentlyDeleteDocument(
        COMMUNITY_SUBSCRIPTIONS_COLLECTION,
        subscriptionId
    );
}
