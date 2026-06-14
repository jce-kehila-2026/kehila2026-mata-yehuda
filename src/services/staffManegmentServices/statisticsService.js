import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import {
    DAY_CENTER_ID,
    PROGRAM_60_PLUS_MINUS_ID,
    SUPPORTIVE_COMMUNITY_ID,
    getFixedProgramTitle,
    resolveCanonicalProgramId
} from "../../utils/staffManegmentUtils/programConstants";
import {
    normalizeRegistration,
    resolveRegistrationActivityId,
    resolveRegistrationProgramId
} from "./registrationService";

const PROGRAM_CHART_LABELS = {
    [DAY_CENTER_ID]: "מרכז יום",
    [PROGRAM_60_PLUS_MINUS_ID]: "60+",
    [SUPPORTIVE_COMMUNITY_ID]: "קהילה תומכת"
};

const PAYMENT_METHOD_LABELS = {
    cash: "מזומן",
    bit: "ביט",
    credit: "אשראי",
    credit_card: "אשראי",
    card: "אשראי",
    other: "אחר"
};

const HEBREW_MONTHS = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר"
];

function readField(data, snakeKey, camelKey) {
    if (!data) {
        return "";
    }

    const value = data[snakeKey] ?? data[camelKey];

    return typeof value === "string" ? value.trim() : value ?? "";
}

function toJsDate(value) {
    if (!value) {
        return null;
    }

    if (typeof value.toDate === "function") {
        return value.toDate();
    }

    if (value.seconds != null) {
        return new Date(value.seconds * 1000);
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function incrementMapCount(map, key, amount = 1) {
    if (!key) {
        return;
    }

    map.set(key, (map.get(key) || 0) + amount);
}

function getActivityName(activityId, activitiesById) {
    if (!activityId) {
        return "";
    }

    const activity = activitiesById.get(activityId);

    return activity?.data?.name?.trim() || activity?.name?.trim() || activityId;
}

function getProgramChartLabel(programId) {
    const canonicalId = resolveCanonicalProgramId(programId);

    if (!canonicalId) {
        return "לא ידוע";
    }

    return (
        PROGRAM_CHART_LABELS[canonicalId] ||
        getFixedProgramTitle(canonicalId) ||
        canonicalId
    );
}

function normalizePaymentMethodKey(rawMethod) {
    const method = String(rawMethod || "")
        .trim()
        .toLowerCase();

    if (!method) {
        return "";
    }

    if (
        method.includes("cash") ||
        method.includes("מזומן") ||
        method === "mzmwn"
    ) {
        return "cash";
    }

    if (method.includes("bit") || method.includes("ביט")) {
        return "bit";
    }

    if (
        method.includes("credit") ||
        method.includes("card") ||
        method.includes("אשראי")
    ) {
        return "credit";
    }

    return "other";
}

function buildMonthlyBuckets(monthCount = 6) {
    const buckets = [];
    const now = new Date();

    for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        buckets.push({
            key,
            label: `${HEBREW_MONTHS[date.getMonth()]} ${date.getFullYear()}`,
            count: 0
        });
    }

    return buckets;
}

function mapToSortedList(countMap, nameResolver, limit = 5) {
    return [...countMap.entries()]
        .map(([id, count]) => ({
            id,
            name: nameResolver(id),
            count
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

export async function fetchStaffStatistics() {
    const [
        participantsSnapshot,
        activitiesSnapshot,
        registrationsSnapshot,
        cancellationsSnapshot,
        paymentsSnapshot
    ] = await Promise.all([
        getDocs(collection(db, "participants")),
        getDocs(collection(db, "activities")),
        getDocs(collection(db, "registrations")),
        getDocs(collection(db, "cancellations")),
        getDocs(collection(db, "payments"))
    ]);

    const activitiesById = new Map(
        activitiesSnapshot.docs.map((activityDoc) => [
            activityDoc.id,
            {
                id: activityDoc.id,
                data: activityDoc.data()
            }
        ])
    );

    const registrationsById = new Map(
        registrationsSnapshot.docs.map((registrationDoc) => [
            registrationDoc.id,
            normalizeRegistration(registrationDoc)
        ])
    );

    const registrations = [...registrationsById.values()];
    const registrationCountsByActivity = new Map();
    const registrationCountsByProgram = new Map();
    const paymentMethodCounts = new Map();
    const monthlyBuckets = buildMonthlyBuckets(6);
    const monthlyBucketIndex = new Map(
        monthlyBuckets.map((bucket, index) => [bucket.key, index])
    );

    registrations.forEach((registration) => {
        const programId = resolveRegistrationProgramId(registration);
        const canonicalProgramId = resolveCanonicalProgramId(programId);
        const activityId = resolveRegistrationActivityId(
            registration,
            programId
        );

        if (activityId) {
            incrementMapCount(registrationCountsByActivity, activityId);
        }

        if (canonicalProgramId) {
            incrementMapCount(registrationCountsByProgram, canonicalProgramId);
        }

        const paymentKey = normalizePaymentMethodKey(registration.payment_method);

        if (paymentKey) {
            incrementMapCount(paymentMethodCounts, paymentKey);
        }

        const registeredAt = toJsDate(registration.registered_at);

        if (registeredAt) {
            const bucketKey = `${registeredAt.getFullYear()}-${String(
                registeredAt.getMonth() + 1
            ).padStart(2, "0")}`;
            const bucketIndex = monthlyBucketIndex.get(bucketKey);

            if (bucketIndex != null) {
                monthlyBuckets[bucketIndex].count += 1;
            }
        }
    });

    paymentsSnapshot.docs.forEach((paymentDoc) => {
        const data = paymentDoc.data();
        const paymentKey = normalizePaymentMethodKey(
            readField(data, "payment_method", "paymentMethod")
        );

        if (paymentKey) {
            incrementMapCount(paymentMethodCounts, paymentKey);
        }
    });

    const cancellationCountsByActivity = new Map();

    cancellationsSnapshot.docs.forEach((cancellationDoc) => {
        const cancellation = cancellationDoc.data();
        const registration = registrationsById.get(
            readField(cancellation, "registration_id", "registrationId")
        );
        const programId = resolveRegistrationProgramId(registration || {});
        const activityId = resolveRegistrationActivityId(
            registration || {},
            programId
        );
        const fallbackActivityName = readField(
            cancellation,
            "activity_name",
            "activityName"
        );

        if (activityId) {
            incrementMapCount(cancellationCountsByActivity, activityId);
            return;
        }

        if (fallbackActivityName) {
            incrementMapCount(
                cancellationCountsByActivity,
                `name:${fallbackActivityName}`
            );
        }
    });

    const topActivities = mapToSortedList(
        registrationCountsByActivity,
        (activityId) => getActivityName(activityId, activitiesById),
        5
    );

    const mostPopularActivity = topActivities[0] || null;

    const registrationsByProgram = [...registrationCountsByProgram.entries()]
        .map(([programId, count]) => ({
            programId,
            label: getProgramChartLabel(programId),
            count
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count);

    const cancellationsByActivity = mapToSortedList(
        cancellationCountsByActivity,
        (key) =>
            key.startsWith("name:")
                ? key.slice(5)
                : getActivityName(key, activitiesById),
        5
    );

    const paymentMethods = [...paymentMethodCounts.entries()]
        .map(([key, count]) => ({
            key,
            label: PAYMENT_METHOD_LABELS[key] || "אחר",
            count
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count);

    return {
        totals: {
            participants: participantsSnapshot.size,
            activities: activitiesSnapshot.size,
            registrations: registrationsSnapshot.size,
            cancellations: cancellationsSnapshot.size
        },
        mostPopularActivity,
        topActivitiesByRegistrations: topActivities,
        registrationsByProgram,
        monthlyRegistrations: monthlyBuckets,
        cancellationsByActivity,
        paymentMethods
    };
}
