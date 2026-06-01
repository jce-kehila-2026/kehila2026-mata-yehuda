export const REFUND_STATUS_PENDING = "ממתין";
export const REFUND_STATUS_REFUNDED = "הוחזר";
export const REFUND_STATUS_NOT_REQUIRED = "לא נדרש";

export const PUBLIC_REFUND_STATUS_MANUAL = "MANUAL_REFUND_REQUIRED";
export const PUBLIC_REFUND_STATUS_AUTOMATIC = "AUTOMATIC_REFUNDED";

export const REFUND_FILTER_ALL = "all";
export const REFUND_FILTER_PENDING = "pending";
export const REFUND_FILTER_REFUNDED = "refunded";

export const REFUND_FILTERS = [
    { id: REFUND_FILTER_ALL, label: "כל הביטולים" },
    { id: REFUND_FILTER_PENDING, label: "ממתין להחזר" },
    { id: REFUND_FILTER_REFUNDED, label: "הוחזר" }
];

export const WHATSAPP_REFUND_MESSAGE = `שלום,
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

export function normalizePhoneForWhatsApp(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (!digits) {
        return "";
    }

    if (digits.startsWith("972")) {
        return digits;
    }

    if (digits.startsWith("0")) {
        return `972${digits.slice(1)}`;
    }

    return digits;
}

export function buildWhatsAppRefundUrl(phone) {
    const normalizedPhone = normalizePhoneForWhatsApp(phone);

    if (!normalizedPhone) {
        return "";
    }

    const text = encodeURIComponent(WHATSAPP_REFUND_MESSAGE);

    return `https://wa.me/${normalizedPhone}?text=${text}`;
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
