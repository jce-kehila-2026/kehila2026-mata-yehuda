import { db } from "../../config/firebase";
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
    buildPaymentDisplay,
    getCancellationAmountValue,
    matchesRefundStatusFilter,
    normalizeCancellationRefundStatus,
    readAmount,
    readField,
    REFUND_STATUS_PENDING,
    resolveDisplayPhone,
    resolveParticipantDisplayName
} from "../../components/cancellations/helpers/cancellationHelpers";
import { normalizeSearchQuery } from "../../utils/staffManegmentUtils/adminListUtils";
import {
    formatProgramTitle,
    getFixedProgramTitle,
    resolveCanonicalProgramId
} from "../../utils/staffManegmentUtils/programConstants";

const cancellationsCollection = collection(db, "cancellations");
const registrationsCollection = collection(db, "registrations");
const paymentsCollection = collection(db, "payments");

export function filterCancellationsList(items, searchQuery, filters = {}) {
    const queryText = normalizeSearchQuery(searchQuery);
    const programFilter = filters.programFilter || "";
    const refundFilter = filters.refundFilter || "";

    return items.filter((item) => {
        if (
            programFilter &&
            resolveCanonicalProgramId(item.programId) !==
                resolveCanonicalProgramId(programFilter)
        ) {
            return false;
        }

        if (!matchesRefundStatusFilter(item, refundFilter)) {
            return false;
        }

        if (!queryText) {
            return true;
        }

        const participantName = normalizeSearchQuery(item.participantFullName);
        const phone = normalizeSearchQuery(item.phone);

        return (
            participantName.includes(queryText) || phone.includes(queryText)
        );
    });
}

export function getCancellationSortValue(item, sortField) {
    switch (sortField) {
        case "participant":
            return item.participantFullName || "";
        case "program":
            return item.programTitle || "";
        case "activity":
            return item.activityName || "";
        case "amount":
            return getCancellationAmountValue(item);
        case "payment_method":
            return item.paymentDisplay?.payment_method ||
                item.paymentDisplay?.payment_status ||
                "";
        case "refund_status":
            return item.cancellation?.refund_status || "";
        case "cancelled_at":
            return item.cancellation?.cancelled_at || null;
        default:
            return item.cancellation?.cancelled_at || null;
    }
}

export async function countCancellationRecords() {
    const snapshot = await getDocs(cancellationsCollection);
    return snapshot.size;
}

function normalizeCancellation(cancellationDoc) {
    const data = cancellationDoc.data ? cancellationDoc.data() : cancellationDoc;
    const id = cancellationDoc.id || data.id;

    const paymentId = readField(data, "payment_id", "paymentId");
    const originalPaymentId = readField(
        data,
        "original_payment_id",
        "originalPaymentId"
    );

    return {
        id,
        participant_id: readField(data, "participant_id", "participantId"),
        registration_id: readField(data, "registration_id", "registrationId"),
        payment_id: paymentId || originalPaymentId,
        original_payment_id: originalPaymentId,
        cancellation_reason: readField(
            data,
            "cancellation_reason",
            "cancellationReason"
        ),
        cancelled_at: readRawCancelledAt(data),
        refund_status: normalizeCancellationRefundStatus(data),
        refund_notes:
            readField(data, "refund_notes", "refundNotes") ||
            readField(data, "refund_note_for_staff", "refundNoteForStaff"),
        first_name: readField(data, "first_name", "firstName"),
        last_name: readField(data, "last_name", "lastName"),
        full_name: readField(data, "full_name", "fullName"),
        phone: readField(data, "phone", "phone"),
        amount: readAmount(data),
        fallback_payment_method: readField(data, "payment_method", "paymentMethod"),
        fallback_payment_status: readField(data, "payment_status", "paymentStatus"),
        payment_method_label: readField(
            data,
            "payment_method_label",
            "paymentMethodLabel"
        ),
        program_title: readField(data, "program_title", "programTitle"),
        activity_name: readField(data, "activity_name", "activityName")
    };
}

function readRawCancelledAt(data) {
    return data?.cancelled_at ?? data?.cancelledAt ?? null;
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

function resolveProgramTitle(programId, programs, cancellation) {
    const canonicalId = resolveCanonicalProgramId(programId);

    if (canonicalId) {
        const program = programs.find((item) => item.id === canonicalId);

        if (program) {
            return formatProgramTitle(program);
        }

        const fixedTitle = getFixedProgramTitle(canonicalId);

        if (fixedTitle) {
            return fixedTitle;
        }
    }

    return cancellation.program_title?.trim() || "";
}

function resolveActivityName(activityId, activities, cancellation) {
    if (activityId) {
        const activity = activities.find((item) => item.id === activityId);

        return activity?.data?.name || activity?.name || "";
    }

    return cancellation.activity_name?.trim() || "";
}

function lookupPayment(cancellation, paymentsById) {
    const paymentIds = [
        cancellation.payment_id,
        cancellation.original_payment_id
    ].filter(Boolean);

    for (const paymentId of paymentIds) {
        const payment = paymentsById.get(paymentId);

        if (payment) {
            return payment;
        }
    }

    return null;
}

function buildCancellationViewModel(
    cancellation,
    { participantsById, registrationsById, paymentsById, programs, activities }
) {
    const participant = participantsById.get(cancellation.participant_id) || null;
    const registration =
        registrationsById.get(cancellation.registration_id) || null;
    const payment = lookupPayment(cancellation, paymentsById);

    const programId = resolveRegistrationProgramId(registration || {});
    const activityId = resolveRegistrationActivityId(
        registration || {},
        programId
    );

    const programTitle = resolveProgramTitle(programId, programs, cancellation);
    const activityName = resolveActivityName(activityId, activities, cancellation);
    const resolvedActivityName = activityName || cancellation.activity_name || "";
    const showActivity = Boolean(activityId || resolvedActivityName);
    const paymentDisplay = buildPaymentDisplay(cancellation, payment);

    return {
        cancellation,
        participant,
        registration,
        payment,
        paymentDisplay,
        participantFullName: resolveParticipantDisplayName(participant, cancellation),
        phone: resolveDisplayPhone(participant, cancellation),
        programTitle,
        activityName: resolvedActivityName,
        showActivity,
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
