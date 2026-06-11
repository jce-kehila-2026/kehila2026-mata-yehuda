import { toSafeString } from "./participantStatusLabels";

export function maskIdNumber(idNumber) {
    const raw = toSafeString(idNumber);

    if (!raw) {
        return "—";
    }

    const digits = raw.replace(/\D/g, "");

    if (!digits) {
        return "—";
    }

    if (digits.length <= 4) {
        return digits;
    }

    return `*****${digits.slice(-4)}`;
}

export function formatMaskedIdForDisplay(idNumber) {
    return maskIdNumber(idNumber);
}
