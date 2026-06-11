import { getPaymentStatusLabel } from "../../../utils/participantStatusLabels";

export const REFUND_STATUS_PENDING = "ממתין";
export const REFUND_STATUS_REFUNDED = "הוחזר";
export const REFUND_STATUS_NOT_REQUIRED = "לא נדרש";
export const REFUND_STATUS_REJECTED = "נדחה";

export const PUBLIC_REFUND_STATUS_MANUAL = "MANUAL_REFUND_REQUIRED";
export const PUBLIC_REFUND_STATUS_AUTOMATIC = "AUTOMATIC_REFUNDED";
export const PUBLIC_REFUND_STATUS_REJECTED = "REFUND_REJECTED";

export const REFUND_FILTER_ALL = "all";
export const REFUND_FILTER_PENDING = "pending";
export const REFUND_FILTER_REFUNDED = "refunded";
export const REFUND_FILTER_REJECTED = "rejected";

export const REFUND_FILTERS = [
    { id: REFUND_FILTER_ALL, label: "כל הסטטוסים" },
    { id: REFUND_FILTER_PENDING, label: "ממתין להחזר" },
    { id: REFUND_FILTER_REFUNDED, label: "הוחזר" },
    { id: REFUND_FILTER_REJECTED, label: "נדחה" }
];

export const REFUND_CONTACT_MESSAGE = `שלום,
אנו מטפלים בהחזר הכספי עבור ההרשמה שלך.
ניצור איתך קשר להשלמת ההחזר.`;

function readRawByKeys(data, snakeKey, camelKey) {
    if (!data) {
        return undefined;
    }

    if (data[snakeKey] !== undefined && data[snakeKey] !== null) {
        return data[snakeKey];
    }

    if (data[camelKey] !== undefined && data[camelKey] !== null) {
        return data[camelKey];
    }

    for (const key of Object.keys(data)) {
        const trimmedKey = key.trim();

        if (trimmedKey === snakeKey || trimmedKey === camelKey) {
            return data[key];
        }
    }

    return undefined;
}

export function readField(data, snakeKey, camelKey) {
    const value = readRawByKeys(data, snakeKey, camelKey);
    return typeof value === "string" ? value.trim() : value ?? "";
}

export function readAmount(data) {
    const value = readRawByKeys(data, "amount", "amount");

    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());

        return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
}

export function normalizeCancellationRefundStatus(data) {
    const raw = readField(data, "refund_status", "refundStatus");

    if (!raw) {
        return REFUND_STATUS_PENDING;
    }

    if (raw === PUBLIC_REFUND_STATUS_MANUAL) {
        return REFUND_STATUS_PENDING;
    }

    if (raw === PUBLIC_REFUND_STATUS_AUTOMATIC) {
        return REFUND_STATUS_REFUNDED;
    }

    if (raw === PUBLIC_REFUND_STATUS_REJECTED || raw === REFUND_STATUS_REJECTED) {
        return REFUND_STATUS_REJECTED;
    }

    return raw;
}

export function formatParticipantFullName(participant) {
    if (!participant) {
        return "—";
    }

    const firstName = participant.first_name || "";
    const lastName = participant.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "—";
}

export function resolveParticipantDisplayName(participant, cancellation = {}) {
    const fromParticipant = formatParticipantFullName(participant);

    if (fromParticipant !== "—") {
        return fromParticipant;
    }

    const fullName = cancellation.full_name || "";

    if (fullName) {
        return fullName;
    }

    const embeddedName = `${cancellation.first_name || ""} ${cancellation.last_name || ""}`.trim();

    if (embeddedName) {
        return embeddedName;
    }

    return "—";
}

export function resolveDisplayPhone(participant, cancellation = {}) {
    const participantPhone = participant?.phone?.trim() || "";

    if (participantPhone) {
        return participantPhone;
    }

    return cancellation.phone?.trim() || "";
}

export function buildPaymentDisplay(cancellation, payment) {
    const joinedAmount =
        payment?.amount ??
        payment?.amount_paid ??
        payment?.total ??
        null;
    const joinedMethod = payment?.payment_method?.trim() || "";
    const joinedStatus = payment?.payment_status?.trim() || "";

    if (payment && (joinedAmount != null || joinedMethod || joinedStatus)) {
        return {
            amount: joinedAmount,
            payment_method: joinedMethod,
            payment_status: joinedStatus
        };
    }

    const fallbackMethod =
        cancellation.fallback_payment_method?.trim() ||
        cancellation.payment_method_label?.trim() ||
        "";

    return {
        amount: cancellation.amount ?? null,
        payment_method: fallbackMethod,
        payment_status: cancellation.fallback_payment_status?.trim() || ""
    };
}

export function normalizePhoneForSms(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (!digits) {
        return "";
    }

    if (digits.startsWith("972")) {
        return `+${digits}`;
    }

    if (digits.startsWith("0")) {
        return `+972${digits.slice(1)}`;
    }

    return `+${digits}`;
}

export function buildSmsRefundUrl(phone) {
    const normalizedPhone = normalizePhoneForSms(phone);

    if (!normalizedPhone) {
        return "";
    }

    const text = encodeURIComponent(REFUND_CONTACT_MESSAGE);

    return `sms:${normalizedPhone}?body=${text}`;
}

export function isBitPaymentMethod(paymentMethod) {
    return String(paymentMethod || "")
        .trim()
        .toLowerCase() === "bit";
}

export function filterCancellationsByRefundStatus(items, filterId) {
    if (filterId === REFUND_FILTER_ALL) {
        return items;
    }

    if (filterId === REFUND_FILTER_PENDING) {
        return items.filter(
            (item) => item.cancellation.refund_status === REFUND_STATUS_PENDING
        );
    }

    if (filterId === REFUND_FILTER_REFUNDED) {
        return items.filter(
            (item) => item.cancellation.refund_status === REFUND_STATUS_REFUNDED
        );
    }

    if (filterId === REFUND_FILTER_REJECTED) {
        return items.filter(
            (item) => item.cancellation.refund_status === REFUND_STATUS_REJECTED
        );
    }

    return items;
}

export function formatCancellationDate(value) {
    if (!value) {
        return "—";
    }

    let date;

    if (value.toDate) {
        date = value.toDate();
    } else if (value.seconds) {
        date = new Date(value.seconds * 1000);
    } else {
        const parsed = new Date(value);
        date = Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (!date) {
        return "—";
    }

    return date.toLocaleDateString("he-IL");
}

export function formatPaymentAmount(paymentOrDisplay) {
    if (!paymentOrDisplay) {
        return "—";
    }

    const amount =
        paymentOrDisplay.amount ??
        paymentOrDisplay.amount_paid ??
        paymentOrDisplay.total ??
        paymentOrDisplay.data?.amount;

    if (amount === undefined || amount === null || amount === "") {
        return "—";
    }

    return typeof amount === "number" ? `${amount} ₪` : String(amount);
}

const PAYMENT_METHOD_LABELS = {
    bit: "ביט",
    cash: "מזומן",
    מזומן: "מזומן",
    ביט: "ביט"
};

export function getRefundStatusLabel(status) {
    const normalized = String(status ?? "").trim();

    if (normalized === REFUND_STATUS_PENDING) {
        return "ממתין להחזר";
    }

    if (normalized === REFUND_STATUS_REFUNDED) {
        return "הוחזר";
    }

    if (normalized === REFUND_STATUS_REJECTED) {
        return "נדחה";
    }

    if (normalized === REFUND_STATUS_NOT_REQUIRED) {
        return "לא נדרש";
    }

    return normalized || "—";
}

export function getRefundStatusBadgeVariant(status) {
    const normalized = String(status ?? "").trim();

    if (normalized === REFUND_STATUS_REFUNDED) {
        return "success";
    }

    if (normalized === REFUND_STATUS_REJECTED) {
        return "danger";
    }

    if (normalized === REFUND_STATUS_PENDING) {
        return "pending";
    }

    return "muted";
}

export function getRefundFilterKey(status) {
    const normalized = String(status ?? "").trim();

    if (normalized === REFUND_STATUS_PENDING) {
        return REFUND_FILTER_PENDING;
    }

    if (normalized === REFUND_STATUS_REFUNDED) {
        return REFUND_FILTER_REFUNDED;
    }

    if (normalized === REFUND_STATUS_REJECTED) {
        return REFUND_FILTER_REJECTED;
    }

    return "";
}

export function matchesRefundStatusFilter(item, filterValue) {
    if (!filterValue || filterValue === REFUND_FILTER_ALL) {
        return true;
    }

    return getRefundFilterKey(item.cancellation?.refund_status) === filterValue;
}

export function formatPaymentMethodLabel(methodOrStatus) {
    const raw = String(methodOrStatus ?? "").trim();

    if (!raw) {
        return "—";
    }

    const lower = raw.toLowerCase();

    if (PAYMENT_METHOD_LABELS[lower]) {
        return PAYMENT_METHOD_LABELS[lower];
    }

    if (PAYMENT_METHOD_LABELS[raw]) {
        return PAYMENT_METHOD_LABELS[raw];
    }

    const statusLabel = getPaymentStatusLabel(raw);

    if (statusLabel && statusLabel !== raw) {
        return statusLabel;
    }

    return raw;
}

export function resolvePaymentMethodDisplay(paymentDisplay) {
    const method = paymentDisplay?.payment_method?.trim() || "";
    const status = paymentDisplay?.payment_status?.trim() || "";

    if (method) {
        return formatPaymentMethodLabel(method);
    }

    if (status) {
        return formatPaymentMethodLabel(status);
    }

    return "—";
}

export function getCancellationAmountValue(item) {
    const amount = item?.paymentDisplay?.amount;

    if (typeof amount === "number" && !Number.isNaN(amount)) {
        return amount;
    }

    if (typeof amount === "string" && amount.trim()) {
        const parsed = Number(amount.trim());
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    return 0;
}

export function computeCancellationListStats(items = []) {
    const stats = {
        total: items.length,
        pending: 0,
        refunded: 0,
        pendingRefundAmount: 0
    };

    items.forEach((item) => {
        const status = item.cancellation?.refund_status;

        if (status === REFUND_STATUS_PENDING) {
            stats.pending += 1;
            stats.pendingRefundAmount += getCancellationAmountValue(item);
        }

        if (status === REFUND_STATUS_REFUNDED) {
            stats.refunded += 1;
        }
    });

    return stats;
}

export function buildCancellationSummaryItems(stats) {
    if (!stats) {
        return [];
    }

    return [
        { key: "total", label: "סה״כ ביטולים", value: stats.total },
        { key: "pending", label: "ממתינים להחזר", value: stats.pending },
        { key: "refunded", label: "הוחזרו", value: stats.refunded },
        {
            key: "pendingRefundAmount",
            label: "סה״כ סכום להחזר",
            value: `${stats.pendingRefundAmount} ₪`
        }
    ];
}
