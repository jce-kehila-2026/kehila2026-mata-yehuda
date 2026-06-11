export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_ACCEPT =
    ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getFileExtension(fileName) {
    const dotIndex = fileName.lastIndexOf(".");

    if (dotIndex < 0) {
        return "";
    }

    return fileName.slice(dotIndex).toLowerCase();
}

function isAllowedImageType(file) {
    if (file.type && ALLOWED_IMAGE_TYPES.has(file.type)) {
        return true;
    }

    return ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(file.name));
}

export function validateImageFile(file) {
    if (!file) {
        return null;
    }

    if (!file.type?.startsWith("image/") && !isAllowedImageType(file)) {
        return "יש לבחור קובץ תמונה בלבד (JPG, PNG או WEBP)";
    }

    if (!isAllowedImageType(file)) {
        return "יש לבחור קובץ תמונה בלבד (JPG, PNG או WEBP)";
    }

    if (file.size > IMAGE_MAX_BYTES) {
        return "גודל התמונה המקסימלי הוא 5MB";
    }

    return null;
}
