export const REFUND_STATUS_PENDING = "ממתין";
export const REFUND_STATUS_REFUNDED = "הוחזר";
export const REFUND_STATUS_NOT_REQUIRED = "לא נדרש";

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

export function readField(data, snakeKey, camelKey) {
    const value = data?.[snakeKey] ?? data?.[camelKey];
    return typeof value === "string" ? value.trim() : value ?? "";
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

export function formatPaymentAmount(payment) {
    if (!payment) {
        return "—";
    }

    const amount =
        payment.amount ??
        payment.amount_paid ??
        payment.total ??
        payment.data?.amount;

    if (amount === undefined || amount === null || amount === "") {
        return "—";
    }

    return typeof amount === "number" ? `${amount} ₪` : String(amount);
}
