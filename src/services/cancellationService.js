import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    updateDoc,
    Timestamp
} from "firebase/firestore";
import { fetchActivities } from "./activityService";
import { fetchParticipants } from "./participantService";
import { fetchPrograms } from "./programService";
import {
    normalizeRegistration,
    resolveRegistrationProgramId,
    resolveRegistrationActivityId
} from "./registrationService";
import {
    formatParticipantFullName,
    readField,
    REFUND_STATUS_PENDING
} from "../components/cancellations/helpers/cancellationHelpers";
import {
    formatProgramTitle,
    getFixedProgramTitle,
    resolveCanonicalProgramId
} from "../utils/programConstants";

const cancellationsCollection = collection(db, "cancellations");
const registrationsCollection = collection(db, "registrations");
const paymentsCollection = collection(db, "payments");

function normalizeCancellation(cancellationDoc) {
    const data = cancellationDoc.data ? cancellationDoc.data() : cancellationDoc;
    const id = cancellationDoc.id || data.id;

    return {
        id,
        participant_id: readField(data, "participant_id", "participantId"),
        registration_id: readField(data, "registration_id", "registrationId"),
        payment_id: readField(data, "payment_id", "paymentId"),
        cancellation_reason: readField(
            data,
            "cancellation_reason",
            "cancellationReason"
        ),
        cancelled_at: data.cancelled_at ?? data.cancelledAt ?? null,
        refund_status: readField(data, "refund_status", "refundStatus") || REFUND_STATUS_PENDING,
        refund_notes: readField(data, "refund_notes", "refundNotes")
    };
}

function normalizePayment(paymentDoc) {
    const data = paymentDoc.data ? paymentDoc.data() : paymentDoc;
    const id = paymentDoc.id || data.id;

    return {
        id,
        participant_id: readField(data, "participant_id", "participantId"),
        registration_id: readField(data, "registration_id", "registrationId"),
        amount: data.amount ?? data.amount_paid ?? data.total ?? null,
        payment_method: readField(data, "payment_method", "paymentMethod"),
        payment_status: readField(data, "payment_status", "paymentStatus")
    };
}

function getCancelledAtTime(cancellation) {
    const cancelledAt = cancellation.cancelled_at;

    if (!cancelledAt) {
        return 0;
    }

    if (cancelledAt.toDate) {
        return cancelledAt.toDate().getTime();
    }

    if (cancelledAt.seconds) {
        return cancelledAt.seconds * 1000;
    }

    const parsed = Date.parse(cancelledAt);

    return Number.isNaN(parsed) ? 0 : parsed;
}

function resolveProgramTitle(programId, programs) {
    const canonicalId = resolveCanonicalProgramId(programId);

    if (!canonicalId) {
        return "";
    }

    const program = programs.find((item) => item.id === canonicalId);

    if (program) {
        return formatProgramTitle(program);
    }

    return getFixedProgramTitle(canonicalId);
}

function resolveActivityName(activityId, activities) {
    if (!activityId) {
        return "";
    }

    const activity = activities.find((item) => item.id === activityId);

    return activity?.data?.name || activity?.name || "";
}

function buildCancellationViewModel(
    cancellation,
    { participantsById, registrationsById, paymentsById, programs, activities }
) {
    const participant = participantsById.get(cancellation.participant_id) || null;
    const registration =
        registrationsById.get(cancellation.registration_id) || null;
    const payment = paymentsById.get(cancellation.payment_id) || null;

    const programId = resolveRegistrationProgramId(registration || {});
    const activityId = resolveRegistrationActivityId(
        registration || {},
        programId
    );

    return {
        cancellation,
        participant,
        registration,
        payment,
        participantFullName: formatParticipantFullName(participant),
        phone: participant?.phone || "",
        programTitle: resolveProgramTitle(programId, programs),
        activityName: resolveActivityName(activityId, activities),
        showActivity: Boolean(activityId),
        programId,
        activityId
    };
}

async function fetchRegistrationsMap() {
    const snapshot = await getDocs(registrationsCollection);

    return new Map(
        snapshot.docs.map((registrationDoc) => [
            registrationDoc.id,
            normalizeRegistration(registrationDoc)
        ])
    );
}

async function fetchPaymentsMap() {
    const snapshot = await getDocs(paymentsCollection);

    return new Map(
        snapshot.docs.map((paymentDoc) => [
            paymentDoc.id,
            normalizePayment(paymentDoc)
        ])
    );
}

export async function getCancellationRequests() {
    const [
        cancellationsSnapshot,
        participants,
        registrationsById,
        paymentsById,
        programs,
        activities
    ] = await Promise.all([
        getDocs(cancellationsCollection),
        fetchParticipants(),
        fetchRegistrationsMap(),
        fetchPaymentsMap(),
        fetchPrograms(),
        fetchActivities()
    ]);

    const participantsById = new Map(participants.map((item) => [item.id, item]));

    const cancellations = cancellationsSnapshot.docs
        .map((cancellationDoc) => normalizeCancellation(cancellationDoc))
        .sort((a, b) => getCancelledAtTime(b) - getCancelledAtTime(a));

    return cancellations.map((cancellation) =>
        buildCancellationViewModel(cancellation, {
            participantsById,
            registrationsById,
            paymentsById,
            programs,
            activities
        })
    );
}

export async function createCancellationRequest(cancellationData) {
    const payload = {
        participant_id: cancellationData.participant_id?.trim() || "",
        registration_id: cancellationData.registration_id?.trim() || "",
        payment_id: cancellationData.payment_id?.trim() || "",
        cancellation_reason: cancellationData.cancellation_reason?.trim() || "",
        cancelled_at: cancellationData.cancelled_at || Timestamp.now(),
        refund_status: cancellationData.refund_status?.trim() || REFUND_STATUS_PENDING,
        refund_notes: cancellationData.refund_notes?.trim() || ""
    };

    return addDoc(cancellationsCollection, payload);
}

export async function updateRefundStatus(cancellationId, { refund_status, refund_notes }) {
    const payload = {
        refund_status: refund_status?.trim() || REFUND_STATUS_PENDING
    };

    if (refund_notes !== undefined) {
        payload.refund_notes = refund_notes.trim();
    }

    return updateDoc(doc(db, "cancellations", cancellationId), payload);
}
