export const NAME_NO_NUMBERS_MESSAGE = "השם אינו יכול להכיל מספרים";

export const TITLE_NO_NUMBERS_MESSAGE = "הכותרת אינה יכולה להכיל מספרים";

export function nameContainsNumber(value) {
    return /\d/.test(String(value ?? ""));
}

export const INVALID_ADDRESS_MESSAGE =
    "יש להזין כתובת תקינה הכוללת אותיות (לדוגמה: רחוב הרצל 15)";

export function isValidAddress(value) {
    const trimmed = String(value ?? "").trim();

    if (!trimmed) {
        return false;
    }

    return /[\u0590-\u05FFa-zA-Z]/.test(trimmed);
}
