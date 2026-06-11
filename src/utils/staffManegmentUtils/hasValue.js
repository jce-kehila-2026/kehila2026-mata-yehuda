const EMPTY_PLACEHOLDERS = new Set(["-", "—"]);

function isEmptyPlaceholder(value) {
    return EMPTY_PLACEHOLDERS.has(String(value).trim());
}

/**
 * True when a value should be shown on staff cards (non-empty, meaningful).
 */
export function hasValue(value) {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === "boolean") {
        return true;
    }

    if (typeof value === "number") {
        return !Number.isNaN(value);
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    if (typeof value === "object") {
        return Object.keys(value).length > 0;
    }

    const trimmed = String(value).trim();

    if (!trimmed || isEmptyPlaceholder(trimmed)) {
        return false;
    }

    return true;
}

/**
 * For optional numeric fields: hide 0 and missing values (e.g. price, max participants).
 */
export function hasDisplayNumber(value) {
    if (value === null || value === undefined || value === "") {
        return false;
    }

    if (typeof value === "number") {
        return !Number.isNaN(value) && value !== 0;
    }

    const trimmed = String(value).trim();

    if (!trimmed || isEmptyPlaceholder(trimmed)) {
        return false;
    }

    const parsed = Number(trimmed);

    if (!Number.isNaN(parsed) && parsed === 0) {
        return false;
    }

    return hasValue(trimmed);
}

/**
 * After formatting (dates, amounts), skip placeholder dashes and blanks.
 */
export function hasFormattedDisplay(formatted) {
    return hasValue(formatted) && !isEmptyPlaceholder(formatted);
}
