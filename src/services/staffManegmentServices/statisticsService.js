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
    resolveRegistrationProgramId,
    getRegistrationParticipantId
} from "./registrationService";

export const STATISTICS_VIEW_MODE = {
    MONTHLY: "monthly",
    YEARLY: "yearly"
};

export const STATISTICS_PERIOD = {
    MONTH: "month"
};

const PROGRAM_CHART_LABELS = {
    [DAY_CENTER_ID]: "מרכז יום",
    [PROGRAM_60_PLUS_MINUS_ID]: "60+",
    [SUPPORTIVE_COMMUNITY_ID]: "קהילה תומכת"
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

const MISSING_ACTIVITY_NAME = "פעילות ללא שם";
const MISSING_PROGRAM_NAME = "תוכנית ללא שם";
const TOP_ACTIVITY_CHART_LIMIT = 10;

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

function startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

function endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}

function endOfMonth(year, monthIndex) {
    return endOfDay(new Date(year, monthIndex + 1, 0));
}

function parseMonthValue(monthValue) {
    const [year, month] = String(monthValue || "").split("-").map(Number);

    if (!year || !month) {
        return null;
    }

    return { year, month: month - 1 };
}

function compareMonthValues(firstMonth, secondMonth) {
    const first = parseMonthValue(firstMonth);
    const second = parseMonthValue(secondMonth);

    if (!first || !second) {
        return 0;
    }

    if (first.year !== second.year) {
        return first.year - second.year;
    }

    return first.month - second.month;
}

function capEndAtToday(endDate) {
    const todayEnd = endOfDay(new Date());

    return endDate > todayEnd ? todayEnd : endDate;
}

export function getCurrentMonthValue() {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatStatisticsMonthDisplay(monthValue) {
    const parsed = parseMonthValue(monthValue);

    if (!parsed) {
        return "";
    }

    const month = String(parsed.month + 1).padStart(2, "0");
    return `${month}/${parsed.year}`;
}

export function formatStatisticsMonthHebrewDisplay(monthValue) {
    const parsed = parseMonthValue(monthValue);

    if (!parsed) {
        return "";
    }

    return `${HEBREW_MONTHS[parsed.month]} ${parsed.year}`;
}

export function resolveStatisticsMonthRange(fromMonth, toMonth) {
    const currentMonth = getCurrentMonthValue();
    const hasFrom = Boolean(fromMonth);
    const hasTo = Boolean(toMonth);

    if (!hasFrom && !hasTo) {
        const parsed = parseMonthValue(currentMonth);

        return {
            range: {
                start: startOfDay(
                    new Date(parsed.year, parsed.month, 1)
                ),
                end: endOfMonth(parsed.year, parsed.month)
            },
            fromLabel: currentMonth,
            toLabel: currentMonth,
            error: null
        };
    }

    const effectiveFrom = fromMonth || toMonth;
    const effectiveTo = toMonth || fromMonth;

    if (compareMonthValues(effectiveFrom, effectiveTo) > 0) {
        return {
            range: null,
            fromLabel: effectiveFrom,
            toLabel: effectiveTo,
            error: "INVALID_RANGE"
        };
    }

    const fromParsed = parseMonthValue(effectiveFrom);
    const toParsed = parseMonthValue(effectiveTo);

    return {
        range: {
            start: startOfDay(
                new Date(fromParsed.year, fromParsed.month, 1)
            ),
            end: endOfMonth(toParsed.year, toParsed.month)
        },
        fromLabel: effectiveFrom,
        toLabel: effectiveTo,
        error: null
    };
}

export function formatStatisticsMonthRangeLabel(fromMonth, toMonth) {
    const resolved = resolveStatisticsMonthRange(fromMonth, toMonth);

    return `${formatStatisticsMonthDisplay(resolved.fromLabel)} - ${formatStatisticsMonthDisplay(resolved.toLabel)}`;
}

export function isInvalidMonthRange(fromMonth, toMonth) {
    if (!fromMonth || !toMonth) {
        return false;
    }

    return compareMonthValues(fromMonth, toMonth) > 0;
}

export function getCurrentYearValue() {
    return String(new Date().getFullYear());
}

export function formatStatisticsYearDisplay(yearValue) {
    const year = Number(yearValue);

    return Number.isFinite(year) ? String(year) : "";
}

export function resolveStatisticsYearRange(fromYear, toYear) {
    const currentYear = Number(getCurrentYearValue());
    const hasFrom = Boolean(fromYear);
    const hasTo = Boolean(toYear);

    if (!hasFrom && !hasTo) {
        return {
            range: {
                start: startOfDay(new Date(currentYear, 0, 1)),
                end: capEndAtToday(endOfDay(new Date(currentYear, 11, 31)))
            },
            fromLabel: String(currentYear),
            toLabel: String(currentYear),
            error: null
        };
    }

    const effectiveFrom = Number(fromYear || toYear);
    const effectiveTo = Number(toYear || fromYear);

    if (effectiveFrom > effectiveTo) {
        return {
            range: null,
            fromLabel: String(effectiveFrom),
            toLabel: String(effectiveTo),
            error: "INVALID_RANGE"
        };
    }

    return {
        range: {
            start: startOfDay(new Date(effectiveFrom, 0, 1)),
            end: capEndAtToday(endOfDay(new Date(effectiveTo, 11, 31)))
        },
        fromLabel: String(effectiveFrom),
        toLabel: String(effectiveTo),
        error: null
    };
}

export function formatStatisticsYearRangeLabel(fromYear, toYear) {
    const resolved = resolveStatisticsYearRange(fromYear, toYear);

    return `${formatStatisticsYearDisplay(resolved.fromLabel)} - ${formatStatisticsYearDisplay(resolved.toLabel)}`;
}

export function isInvalidYearRange(fromYear, toYear) {
    if (!fromYear || !toYear) {
        return false;
    }

    return Number(fromYear) > Number(toYear);
}

export function resolveStatisticsFilter(mode, fromValue, toValue) {
    if (mode === STATISTICS_VIEW_MODE.YEARLY) {
        return resolveStatisticsYearRange(fromValue, toValue);
    }

    return resolveStatisticsMonthRange(fromValue, toValue);
}

export function formatStatisticsRangeLabel(mode, fromValue, toValue) {
    if (mode === STATISTICS_VIEW_MODE.YEARLY) {
        return formatStatisticsYearRangeLabel(fromValue, toValue);
    }

    return formatStatisticsMonthRangeLabel(fromValue, toValue);
}

export function isInvalidStatisticsRange(mode, fromValue, toValue) {
    if (mode === STATISTICS_VIEW_MODE.YEARLY) {
        return isInvalidYearRange(fromValue, toValue);
    }

    return isInvalidMonthRange(fromValue, toValue);
}

export function getStatisticsRangeValidationMessage(mode) {
    if (mode === STATISTICS_VIEW_MODE.YEARLY) {
        return "שנת ההתחלה חייבת להיות לפני שנת הסיום או שווה לה.";
    }

    return "חודש ההתחלה חייב להיות לפני חודש הסיום או שווה לו.";
}

function isDateInRange(date, rangeStart, rangeEnd) {
    if (!date || !rangeStart || !rangeEnd) {
        return false;
    }

    const time = date.getTime();
    return time >= rangeStart.getTime() && time <= rangeEnd.getTime();
}

function incrementMapCount(map, key, amount = 1) {
    if (!key) {
        return;
    }

    map.set(key, (map.get(key) || 0) + amount);
}

function getActivityName(activityId, activitiesById) {
    if (!activityId) {
        return MISSING_ACTIVITY_NAME;
    }

    const activity = activitiesById.get(activityId);
    const name = activity?.data?.name?.trim() || activity?.name?.trim();

    return name || MISSING_ACTIVITY_NAME;
}

function getProgramChartLabel(programId) {
    const canonicalId = resolveCanonicalProgramId(programId);

    if (!canonicalId) {
        return MISSING_PROGRAM_NAME;
    }

    return (
        PROGRAM_CHART_LABELS[canonicalId] ||
        getFixedProgramTitle(canonicalId) ||
        MISSING_PROGRAM_NAME
    );
}

function buildYearlyBuckets(dateRange) {
    const buckets = [];
    const startYear = dateRange.start.getFullYear();
    const endYear = dateRange.end.getFullYear();

    for (let year = startYear; year <= endYear; year += 1) {
        buckets.push({
            key: String(year),
            label: String(year),
            count: 0
        });
    }

    return buckets;
}

function buildMonthlyBuckets(dateRange) {
    const buckets = [];
    const cursor = new Date(
        dateRange.start.getFullYear(),
        dateRange.start.getMonth(),
        1
    );
    const endMonth = new Date(
        dateRange.end.getFullYear(),
        dateRange.end.getMonth(),
        1
    );

    while (cursor <= endMonth) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
        buckets.push({
            key,
            label: `${HEBREW_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`,
            count: 0
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
}

function buildTimeBuckets(dateRange, timeSeriesMode) {
    if (timeSeriesMode === STATISTICS_VIEW_MODE.YEARLY) {
        return buildYearlyBuckets(dateRange);
    }

    return buildMonthlyBuckets(dateRange);
}

function countPositiveMapEntries(countMap) {
    return [...countMap.values()].filter((count) => count > 0).length;
}

function mapToSortedList(countMap, nameResolver, limit = TOP_ACTIVITY_CHART_LIMIT) {
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

export async function fetchStaffStatistics(
    dateRange,
    timeSeriesMode = STATISTICS_VIEW_MODE.MONTHLY
) {
    if (!dateRange?.start || !dateRange?.end) {
        throw new Error("Date range is required");
    }

    const [
        activitiesSnapshot,
        registrationsSnapshot,
        cancellationsSnapshot
    ] = await Promise.all([
        getDocs(collection(db, "activities")),
        getDocs(collection(db, "registrations")),
        getDocs(collection(db, "cancellations"))
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

    const registrationCountsByActivity = new Map();
    const registrationCountsByProgram = new Map();
    const participantsInRange = new Set();
    const activitiesInRange = new Set();
    let registrationsInRange = 0;

    const timeBuckets = buildTimeBuckets(dateRange, timeSeriesMode);
    const timeBucketIndex = new Map(
        timeBuckets.map((bucket, index) => [bucket.key, index])
    );
    const isYearlyView = timeSeriesMode === STATISTICS_VIEW_MODE.YEARLY;

    [...registrationsById.values()].forEach((registration) => {
        const registeredAt = toJsDate(registration.registered_at);

        if (!isDateInRange(registeredAt, dateRange.start, dateRange.end)) {
            return;
        }

        registrationsInRange += 1;

        const programId = resolveRegistrationProgramId(registration);
        const canonicalProgramId = resolveCanonicalProgramId(programId);
        const activityId = resolveRegistrationActivityId(
            registration,
            programId
        );
        const participantId = getRegistrationParticipantId(registration);

        if (participantId) {
            participantsInRange.add(participantId);
        }

        if (activityId) {
            incrementMapCount(registrationCountsByActivity, activityId);
            activitiesInRange.add(activityId);
        }

        if (canonicalProgramId) {
            incrementMapCount(registrationCountsByProgram, canonicalProgramId);
        }

        if (registeredAt) {
            const bucketKey = isYearlyView
                ? String(registeredAt.getFullYear())
                : `${registeredAt.getFullYear()}-${String(
                      registeredAt.getMonth() + 1
                  ).padStart(2, "0")}`;
            const bucketIndex = timeBucketIndex.get(bucketKey);

            if (bucketIndex != null) {
                timeBuckets[bucketIndex].count += 1;
            }
        }
    });

    const cancellationCountsByActivity = new Map();
    let cancellationsInRange = 0;

    cancellationsSnapshot.docs.forEach((cancellationDoc) => {
        const cancellation = cancellationDoc.data();
        const cancelledAt = toJsDate(
            cancellation.cancelled_at ?? cancellation.cancelledAt
        );

        if (!isDateInRange(cancelledAt, dateRange.start, dateRange.end)) {
            return;
        }

        cancellationsInRange += 1;

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
        } else {
            incrementMapCount(
                cancellationCountsByActivity,
                `name:${MISSING_ACTIVITY_NAME}`
            );
        }
    });

    const topActivities = mapToSortedList(
        registrationCountsByActivity,
        (activityId) => getActivityName(activityId, activitiesById),
        TOP_ACTIVITY_CHART_LIMIT
    );

    const registrationsByProgram = [...registrationCountsByProgram.entries()]
        .map(([programId, count]) => ({
            programId,
            label: getProgramChartLabel(programId),
            count
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count);

    const totalActivitiesWithCancellations = countPositiveMapEntries(
        cancellationCountsByActivity
    );

    const cancellationsByActivity = mapToSortedList(
        cancellationCountsByActivity,
        (key) =>
            key.startsWith("name:")
                ? key.slice(5) || MISSING_ACTIVITY_NAME
                : getActivityName(key, activitiesById),
        TOP_ACTIVITY_CHART_LIMIT
    );

    return {
        totals: {
            participants: participantsInRange.size,
            activities: activitiesInRange.size,
            registrations: registrationsInRange,
            cancellations: cancellationsInRange
        },
        mostPopularActivity: topActivities[0] || null,
        topActivitiesByRegistrations: topActivities,
        registrationsByProgram,
        registrationsOverTime: timeBuckets,
        timeSeriesGranularity: isYearlyView ? "year" : "month",
        cancellationsByActivity,
        totalActivitiesWithCancellations,
        dateRange: {
            start: dateRange.start,
            end: dateRange.end
        }
    };
}
