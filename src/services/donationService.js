import { db } from "../config/firebase";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc
} from "firebase/firestore";
import { normalizeSearchQuery } from "../utils/staffManegmentUtils/adminListUtils";
import {
    resolveStatisticsFilter,
    STATISTICS_VIEW_MODE
} from "./staffManegmentServices/statisticsService";

const donationsCollection = collection(db, "donations");
const ADMIN_QUERY_LIMIT = 2000;

export const PAYMENT_METHOD_OPTIONS = [
    { value: "cash", label: "מזומן" },
    { value: "bit", label: "ביט" },
    { value: "bank_transfer", label: "העברה בנקאית" },
    { value: "credit", label: "אשראי" }
];

const PAYMENT_METHOD_LABELS = Object.fromEntries(
    PAYMENT_METHOD_OPTIONS.map((option) => [option.value, option.label])
);

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

export const DONATION_MONTH_OPTIONS = HEBREW_MONTHS.map((label, index) => ({
    value: String(index + 1),
    label
}));

export const DONATION_EMPTY_FILTERS = {
    month: "",
    year: "",
    donorName: "",
    minAmount: "",
    maxAmount: ""
};

export function getPaymentMethodLabel(method) {
    const normalized = String(method || "").trim();
    return PAYMENT_METHOD_LABELS[normalized] || normalized || "—";
}

function mapLegacyPaymentMethod(method) {
    const normalized = String(method || "").trim().toLowerCase();

    if (normalized === "cash" || normalized === "מזומן") {
        return "cash";
    }

    if (normalized === "bit") {
        return "bit";
    }

    if (
        normalized.includes("transfer") ||
        normalized.includes("bank") ||
        normalized.includes("העברה")
    ) {
        return "bank_transfer";
    }

    if (
        normalized.includes("credit") ||
        normalized.includes("paypal") ||
        normalized.includes("אשראי")
    ) {
        return "credit";
    }

    return method || "unknown";
}

export function timestampToDate(value) {
    if (!value) {
        return null;
    }

    if (typeof value.toDate === "function") {
        return value.toDate();
    }

    if (value instanceof Date) {
        return value;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

export function getDonationDateValue(donation) {
    const date = timestampToDate(donation?.donation_date);

    if (!date) {
        return 0;
    }

    return date.getTime();
}

export function normalizeDonation(documentId, data = {}) {
    return {
        id: documentId,
        donor_name: String(data.donor_name || data.firstName || "").trim(),
        phone: String(data.phone || "").trim(),
        amount: Number(data.amount) || 0,
        donation_date:
            data.donation_date ||
            data.completedAt ||
            data.created_at ||
            data.createdAt ||
            null,
        payment_method: data.payment_method
            ? String(data.payment_method)
            : mapLegacyPaymentMethod(data.paymentMethod),
        notes: String(data.notes || "").trim(),
        created_at: data.created_at || data.createdAt || null
    };
}

export function filterDonationsList(donations, searchQuery) {
    const queryText = normalizeSearchQuery(searchQuery);

    if (!queryText) {
        return donations;
    }

    return donations.filter((donation) => {
        const donorName = normalizeSearchQuery(donation.donor_name);
        const phone = normalizeSearchQuery(donation.phone);

        return donorName.includes(queryText) || phone.includes(queryText);
    });
}

export function getDonationYearOptions(donations = []) {
    const years = new Set([new Date().getFullYear()]);

    donations.forEach((donation) => {
        const date = timestampToDate(donation.donation_date);

        if (date) {
            years.add(date.getFullYear());
        }
    });

    return Array.from(years).sort((left, right) => right - left);
}

function parseAmountFilter(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
}

export function filterDonationsByCriteria(donations, filters = {}) {
    const month = filters.month ? Number(filters.month) : null;
    const year = filters.year ? Number(filters.year) : null;
    const donorQuery = normalizeSearchQuery(filters.donorName || "");
    const minAmount = parseAmountFilter(filters.minAmount);
    const maxAmount = parseAmountFilter(filters.maxAmount);

    return donations.filter((donation) => {
        const date = timestampToDate(donation.donation_date);

        if (year && (!date || date.getFullYear() !== year)) {
            return false;
        }

        if (month && (!date || date.getMonth() + 1 !== month)) {
            return false;
        }

        if (donorQuery) {
            const donorName = normalizeSearchQuery(donation.donor_name);

            if (!donorName.includes(donorQuery)) {
                return false;
            }
        }

        if (minAmount !== null && donation.amount < minAmount) {
            return false;
        }

        if (maxAmount !== null && donation.amount > maxAmount) {
            return false;
        }

        return true;
    });
}

export function hasActiveDonationFilters(filters = {}) {
    return Object.entries(DONATION_EMPTY_FILTERS).some(([key, emptyValue]) => {
        const current = filters[key];

        if (current === null || current === undefined) {
            return false;
        }

        return String(current).trim() !== String(emptyValue).trim();
    });
}

export function getDonationSortValue(donation, sortField) {
    switch (sortField) {
        case "amount":
            return donation.amount;
        case "date":
            return getDonationDateValue(donation);
        case "donor_name":
        default:
            return donation.donor_name;
    }
}

function parseDonationDateInput(value) {
    if (!value) {
        return Timestamp.now();
    }

    if (value instanceof Timestamp) {
        return value;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("INVALID_DONATION_DATE");
    }

    return Timestamp.fromDate(parsedDate);
}

function buildDonationPayload(data) {
    const donorName = String(data.donor_name || "").trim();
    const amount = Number(data.amount);

    if (!donorName) {
        throw new Error("DONOR_NAME_REQUIRED");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("INVALID_DONATION_AMOUNT");
    }

    return {
        donor_name: donorName,
        phone: String(data.phone || "").trim(),
        amount,
        donation_date: parseDonationDateInput(data.donation_date),
        payment_method: String(data.payment_method || "cash").trim(),
        notes: String(data.notes || "").trim()
    };
}

export async function getDonations() {
    const snapshot = await getDocs(
        query(donationsCollection, limit(ADMIN_QUERY_LIMIT))
    );

    return snapshot.docs
        .map((donationDoc) =>
            normalizeDonation(donationDoc.id, donationDoc.data())
        )
        .sort((left, right) => getDonationDateValue(right) - getDonationDateValue(left));
}

export async function addDonation(data) {
    const payload = buildDonationPayload(data);

    await addDoc(donationsCollection, {
        ...payload,
        created_at: serverTimestamp(),
        source: "staff-dashboard"
    });
}

export async function updateDonation(donationId, data) {
    if (!donationId) {
        throw new Error("DONATION_ID_REQUIRED");
    }

    const payload = buildDonationPayload(data);

    await updateDoc(doc(donationsCollection, donationId), {
        ...payload,
        updated_at: serverTimestamp()
    });
}

export async function deleteDonation(donationId) {
    if (!donationId) {
        throw new Error("DONATION_ID_REQUIRED");
    }

    await deleteDoc(doc(donationsCollection, donationId));
}

function getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export const DEFAULT_DONATION_PERIOD_FILTER = {
    mode: STATISTICS_VIEW_MODE.MONTHLY,
    from: "",
    to: ""
};

export function hasCustomDonationPeriodFilter(
    periodFilter = DEFAULT_DONATION_PERIOD_FILTER
) {
    return Boolean(periodFilter?.from || periodFilter?.to);
}

export function filterDonationsByPeriod(
    donations,
    periodFilter = DEFAULT_DONATION_PERIOD_FILTER
) {
    const resolved = resolveStatisticsFilter(
        periodFilter.mode,
        periodFilter.from,
        periodFilter.to
    );

    if (!resolved.range || resolved.error) {
        return [];
    }

    const rangeStart = resolved.range.start.getTime();
    const rangeEnd = resolved.range.end.getTime();

    return donations.filter((donation) => {
        const date = timestampToDate(donation.donation_date);

        if (!date) {
            return false;
        }

        const time = date.getTime();
        return time >= rangeStart && time <= rangeEnd;
    });
}

function buildDonationMonthlyBuckets(dateRange) {
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
        const key = getMonthKey(cursor);

        buckets.push({
            key,
            label: `${HEBREW_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`,
            amount: 0
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
}

function buildDonationYearlyBuckets(dateRange) {
    const buckets = [];
    const startYear = dateRange.start.getFullYear();
    const endYear = dateRange.end.getFullYear();

    for (let year = startYear; year <= endYear; year += 1) {
        buckets.push({
            key: String(year),
            label: String(year),
            amount: 0
        });
    }

    return buckets;
}

function buildDonationPeriodChartData(
    donations,
    periodFilter = DEFAULT_DONATION_PERIOD_FILTER
) {
    const resolved = resolveStatisticsFilter(
        periodFilter.mode,
        periodFilter.from,
        periodFilter.to
    );

    if (!resolved.range || resolved.error) {
        return [];
    }

    const buckets =
        periodFilter.mode === STATISTICS_VIEW_MODE.YEARLY
            ? buildDonationYearlyBuckets(resolved.range)
            : buildDonationMonthlyBuckets(resolved.range);
    const bucketMap = Object.fromEntries(
        buckets.map((bucket) => [bucket.key, bucket])
    );

    donations.forEach((donation) => {
        const date = timestampToDate(donation.donation_date);

        if (!date) {
            return;
        }

        const key =
            periodFilter.mode === STATISTICS_VIEW_MODE.YEARLY
                ? String(date.getFullYear())
                : getMonthKey(date);
        const bucket = bucketMap[key];

        if (bucket) {
            bucket.amount += donation.amount;
        }
    });

    return buckets.map(({ label, amount }) => ({ label, amount }));
}

export function getDonationChartTitle(
    periodFilter = DEFAULT_DONATION_PERIOD_FILTER
) {
    if (periodFilter.mode === STATISTICS_VIEW_MODE.YEARLY) {
        return "תרומות לפי שנה";
    }

    return "תרומות לפי חודש";
}

function getTopDonor(donations) {
    const totalsByDonor = new Map();

    donations.forEach((donation) => {
        const donorKey =
            donation.donor_name ||
            donation.phone ||
            `anonymous-${donation.id}`;

        totalsByDonor.set(
            donorKey,
            (totalsByDonor.get(donorKey) || 0) + donation.amount
        );
    });

    let topDonor = { name: "—", total: 0 };

    totalsByDonor.forEach((total, name) => {
        if (total > topDonor.total) {
            topDonor = { name, total };
        }
    });

    return topDonor;
}

export function getDonationStatistics(
    donations = [],
    periodFilter = DEFAULT_DONATION_PERIOD_FILTER
) {
    const totalAmount = donations.reduce(
        (sum, donation) => sum + donation.amount,
        0
    );
    const donationCount = donations.length;
    const uniqueDonors = new Set(
        donations
            .map((donation) =>
                donation.donor_name || donation.phone
                    ? `${donation.donor_name}|${donation.phone}`
                    : donation.id
            )
            .filter(Boolean)
    ).size;
    const averageAmount =
        donationCount > 0 ? totalAmount / donationCount : 0;
    const largestDonation = donations.reduce(
        (max, donation) => Math.max(max, donation.amount),
        0
    );

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthlyTotal = donations.reduce((sum, donation) => {
        const date = timestampToDate(donation.donation_date);

        if (!date || date < monthStart || date >= monthEnd) {
            return sum;
        }

        return sum + donation.amount;
    }, 0);

    return {
        totalAmount,
        donationCount,
        uniqueDonors,
        averageAmount,
        largestDonation,
        monthlyTotal,
        topDonor: getTopDonor(donations),
        monthlyChartData: buildDonationPeriodChartData(donations, periodFilter)
    };
}
