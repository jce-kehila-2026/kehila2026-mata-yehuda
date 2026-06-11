import { lookupStatusEntry, normalizeStatusKey } from "./statusMapUtils";

export const UNKNOWN_STATUS_LABEL = "לא ידוע";

export const REGISTRATION_STATUS_FILTER_OPTIONS = [
    { value: "registered", label: "רשום" },
    { value: "waiting", label: "ממתין" },
    { value: "completed", label: "הושלם" },
    { value: "cancelled", label: "בוטל" }
];

export const PAYMENT_STATUS_FILTER_OPTIONS = [
    { value: "COMPLETED", label: "שולם" },
    { value: "PENDING_PAYMENT", label: "ממתין לתשלום" },
    { value: "PENDING_CASH_PAYMENT", label: "ממתין לתשלום במזומן" },
    { value: "WAITING_FOR_BIT_PAYMENT", label: "ממתין לתשלום בביט" },
    { value: "CANCELLED", label: "בוטל" }
];

const REGISTRATION_STATUS_DEFINITIONS = [
    {
        keys: ["registered", "רשום"],
        label: "רשום",
        filterKey: "registered",
        className: "success"
    },
    {
        keys: ["waiting", "ממתין"],
        label: "ממתין",
        filterKey: "waiting",
        className: "pending"
    },
    {
        keys: ["completed", "הושלם"],
        label: "הושלם",
        filterKey: "completed",
        className: "success"
    },
    {
        keys: ["cancelled", "canceled", "בוטל"],
        label: "בוטל",
        filterKey: "cancelled",
        className: "danger"
    }
];

const PAYMENT_STATUS_DEFINITIONS = [
    {
        keys: ["COMPLETED", "completed"],
        label: "שולם",
        filterKey: "COMPLETED",
        className: "success"
    },
    {
        keys: ["PENDING_PAYMENT", "pending_payment", "pending"],
        label: "ממתין לתשלום",
        filterKey: "PENDING_PAYMENT",
        className: "pending"
    },
    {
        keys: ["PENDING_CASH_PAYMENT", "pending_cash_payment"],
        label: "ממתין לתשלום במזומן",
        filterKey: "PENDING_CASH_PAYMENT",
        className: "pending"
    },
    {
        keys: ["WAITING_FOR_BIT_PAYMENT", "waiting_for_bit_payment"],
        label: "ממתין לתשלום בביט",
        filterKey: "WAITING_FOR_BIT_PAYMENT",
        className: "pending"
    },
    {
        keys: ["CANCELLED", "cancelled", "canceled"],
        label: "בוטל",
        filterKey: "CANCELLED",
        className: "danger"
    }
];

function buildStatusMap(definitions) {
    const map = {};

    definitions.forEach((definition) => {
        definition.keys.forEach((key) => {
            map[key] = {
                label: definition.label,
                className: definition.className,
                filterKey: definition.filterKey
            };
        });
    });

    return map;
}

const REGISTRATION_STATUS_MAP = buildStatusMap(REGISTRATION_STATUS_DEFINITIONS);
const PAYMENT_STATUS_MAP = buildStatusMap(PAYMENT_STATUS_DEFINITIONS);

export function toSafeString(value) {
    return normalizeStatusKey(value);
}

function inferRegistrationVariant(value) {
    const normalized = normalizeStatusKey(value).toLowerCase();

    if (["registered", "completed", "הושלם", "רשום"].includes(normalized)) {
        return "success";
    }

    if (["waiting", "ממתין"].includes(normalized)) {
        return "pending";
    }

    if (["cancelled", "canceled", "בוטל"].includes(normalized)) {
        return "danger";
    }

    return "muted";
}

function inferPaymentVariant(value) {
    const normalized = normalizeStatusKey(value).toLowerCase();

    if (normalized === "completed") {
        return "success";
    }

    if (normalized === "cancelled" || normalized === "canceled") {
        return "danger";
    }

    if (
        normalized === "pending" ||
        normalized === "pending_payment" ||
        normalized === "pending_cash_payment" ||
        normalized === "waiting_for_bit_payment"
    ) {
        return "pending";
    }

    return "muted";
}

export function getRegistrationFilterKey(status) {
    const key = normalizeStatusKey(status);

    if (!key) {
        return "";
    }

    const entry = lookupStatusEntry(key, REGISTRATION_STATUS_MAP);

    if (entry?.filterKey) {
        return entry.filterKey;
    }

    const normalized = key.toLowerCase();

    if (normalized === "registered" || normalized === "רשום") {
        return "registered";
    }

    if (normalized === "waiting" || normalized === "ממתין") {
        return "waiting";
    }

    if (normalized === "completed" || normalized === "הושלם") {
        return "completed";
    }

    if (["cancelled", "canceled", "בוטל"].includes(normalized)) {
        return "cancelled";
    }

    return key;
}

export function getPaymentFilterKey(status) {
    const key = normalizeStatusKey(status);

    if (!key) {
        return "";
    }

    const entry = lookupStatusEntry(key, PAYMENT_STATUS_MAP);

    if (entry?.filterKey) {
        return entry.filterKey;
    }

    const normalized = key.toLowerCase();

    if (normalized === "completed") {
        return "COMPLETED";
    }

    if (normalized === "cancelled" || normalized === "canceled") {
        return "CANCELLED";
    }

    if (normalized === "pending" || normalized === "pending_payment") {
        return "PENDING_PAYMENT";
    }

    if (normalized === "pending_cash_payment") {
        return "PENDING_CASH_PAYMENT";
    }

    if (normalized === "waiting_for_bit_payment") {
        return "WAITING_FOR_BIT_PAYMENT";
    }

    return key;
}

export function matchesRegistrationStatusFilter(participantStatus, filterValue) {
    if (!filterValue) {
        return true;
    }

    return (
        getRegistrationFilterKey(participantStatus) === filterValue
    );
}

export function matchesPaymentStatusFilter(participantStatus, filterValue) {
    if (!filterValue) {
        return true;
    }

    return getPaymentFilterKey(participantStatus) === filterValue;
}

export function getStatusLabel(status, map) {
    const key = normalizeStatusKey(status);

    if (!key) {
        return UNKNOWN_STATUS_LABEL;
    }

    const entry = lookupStatusEntry(key, map);

    if (entry?.label) {
        return entry.label;
    }

    return key || UNKNOWN_STATUS_LABEL;
}

export function getStatusClass(status, map) {
    const key = normalizeStatusKey(status);

    if (!key) {
        return "muted";
    }

    const entry = lookupStatusEntry(key, map);

    return entry?.className || "muted";
}

export function getRegistrationStatusLabel(status) {
    return getStatusLabel(status, REGISTRATION_STATUS_MAP);
}

export function getPaymentStatusLabel(status) {
    const key = normalizeStatusKey(status);

    if (!key) {
        return UNKNOWN_STATUS_LABEL;
    }

    const entry = lookupStatusEntry(key, PAYMENT_STATUS_MAP);

    if (entry?.label) {
        return entry.label;
    }

    const inferred = inferPaymentVariant(key);

    if (inferred === "success") {
        return "שולם";
    }

    if (inferred === "danger") {
        return "בוטל";
    }

    if (inferred === "pending") {
        return "ממתין לתשלום";
    }

    return key || UNKNOWN_STATUS_LABEL;
}

export function getRegistrationStatusBadgeVariant(status) {
    const key = normalizeStatusKey(status);

    if (!key) {
        return "muted";
    }

    return lookupStatusEntry(key, REGISTRATION_STATUS_MAP)?.className ||
        inferRegistrationVariant(key);
}

export function getPaymentStatusBadgeVariant(status) {
    const key = normalizeStatusKey(status);

    if (!key) {
        return "muted";
    }

    return lookupStatusEntry(key, PAYMENT_STATUS_MAP)?.className ||
        inferPaymentVariant(key);
}

export function isRegisteredStatus(status) {
    return getRegistrationFilterKey(status) === "registered";
}

export function isPendingPaymentStatus(_registrationStatus, paymentStatus) {
    const paymentKey = getPaymentFilterKey(paymentStatus);

    return (
        paymentKey === "PENDING_PAYMENT" ||
        paymentKey === "PENDING_CASH_PAYMENT" ||
        paymentKey === "WAITING_FOR_BIT_PAYMENT"
    );
}
