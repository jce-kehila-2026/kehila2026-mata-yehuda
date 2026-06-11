/**
 * Server-side notification audience resolution.
 * 60+ targeting uses live registration + activity data at send time.
 */

export const NOTIFICATION_GROUP_60_PLUS = "60_plus";
const PROGRAM_60_PLUS_MINUS_ID = "60_plus_minus";
const LEGACY_60_PLUS_PROGRAM_IDS = new Set(["60+-", "program_60_plus"]);
const PARTICIPANT_ID_BATCH_SIZE = 30;

const CANCELLED_STATUS_KEYS = new Set(["cancelled", "canceled", "בוטל"]);
const PENDING_STATUS_VALUES = new Set(["ממתין", "waiting"]);

function normalizeStatusKey(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function readField(data, snakeKey, camelKey) {
    const raw = data?.[snakeKey] ?? data?.[camelKey];
    return typeof raw === "string" ? raw.trim() : raw ?? "";
}

function readParticipantId(data) {
    return readField(data, "participant_id", "participantId");
}

function readActivityId(data) {
    return readField(data, "activity_id", "activityId");
}

function resolveRegistrationProgramId(data) {
    const programId = readField(data, "program_id", "programId");

    if (LEGACY_60_PLUS_PROGRAM_IDS.has(programId)) {
        return PROGRAM_60_PLUS_MINUS_ID;
    }

    if (programId) {
        return programId;
    }

    if (readActivityId(data)) {
        return PROGRAM_60_PLUS_MINUS_ID;
    }

    return "";
}

function is60PlusRegistration(data) {
    return resolveRegistrationProgramId(data) === PROGRAM_60_PLUS_MINUS_ID;
}

/**
 * Approved/active for 60+ pushes: not pending and not cancelled.
 */
export function isRegistrationApprovedFor60Plus(data) {
    const status = readField(data, "registration_status", "registrationStatus");

    if (!status) {
        return false;
    }

    if (PENDING_STATUS_VALUES.has(status)) {
        return false;
    }

    const normalizedStatus = normalizeStatusKey(status);

    if (CANCELLED_STATUS_KEYS.has(normalizedStatus)) {
        return false;
    }

    return true;
}

function toActivityDate(value) {
    if (value == null || value === "") {
        return null;
    }

    if (typeof value.toDate === "function") {
        const date = value.toDate();
        return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    }

    if (typeof value === "object" && typeof value.seconds === "number") {
        const date = new Date(value.seconds * 1000);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "string") {
        const parsed = new Date(value.trim());
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
}

function startOfLocalDay(date) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
}

/**
 * 60+ activity is active when open and end_date is today or in the future.
 */
export function isActivityActiveFor60Plus(activityData, now = new Date()) {
    if (!activityData) {
        return false;
    }

    if (activityData.is_open !== true) {
        return false;
    }

    const endDate = toActivityDate(activityData.end_date ?? activityData.endDate);

    if (!endDate) {
        return false;
    }

    const todayStart = startOfLocalDay(now);
    const endDay = startOfLocalDay(endDate);

    return endDay.getTime() >= todayStart.getTime();
}

/**
 * Participant ids with at least one approved 60+ registration tied to an active activity.
 */
export async function getEligible60PlusParticipantIds(db) {
    const [registrationsSnapshot, activitiesSnapshot] = await Promise.all([
        db.collection("registrations").get(),
        db.collection("activities").get()
    ]);

    const activitiesById = new Map();

    activitiesSnapshot.docs.forEach((activityDoc) => {
        activitiesById.set(activityDoc.id, activityDoc.data());
    });

    const eligibleParticipantIds = new Set();

    registrationsSnapshot.docs.forEach((registrationDoc) => {
        const data = registrationDoc.data();

        if (!is60PlusRegistration(data)) {
            return;
        }

        if (!isRegistrationApprovedFor60Plus(data)) {
            return;
        }

        const participantId = readParticipantId(data);
        const activityId = readActivityId(data);

        if (!participantId || !activityId) {
            return;
        }

        const activityData = activitiesById.get(activityId);

        if (!isActivityActiveFor60Plus(activityData)) {
            return;
        }

        eligibleParticipantIds.add(participantId);
    });

    return eligibleParticipantIds;
}

async function fetchActiveTokensForParticipantBatch(db, participantIds) {
    if (participantIds.length === 0) {
        return [];
    }

    const snapshot = await db
        .collection("notification_tokens")
        .where("participantId", "in", participantIds)
        .where("isActive", "==", true)
        .get();

    return snapshot.docs;
}

/**
 * Loads FCM tokens for 60+ sends from eligible participants (send-time source of truth).
 * Deduplicates by token string so one device never receives duplicates.
 */
export async function load60PlusTargetTokenDocs(db) {
    const eligibleParticipantIds = await getEligible60PlusParticipantIds(db);
    const participantIdList = [...eligibleParticipantIds];

    if (participantIdList.length === 0) {
        return [];
    }

    const tokenDocs = [];

    for (let offset = 0; offset < participantIdList.length; offset += PARTICIPANT_ID_BATCH_SIZE) {
        const batch = participantIdList.slice(offset, offset + PARTICIPANT_ID_BATCH_SIZE);
        const batchDocs = await fetchActiveTokensForParticipantBatch(db, batch);
        tokenDocs.push(...batchDocs);
    }

    return tokenDocs;
}
