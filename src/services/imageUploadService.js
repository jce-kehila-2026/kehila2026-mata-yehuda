import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase";

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

    if (!isAllowedImageType(file)) {
        return "ניתן להעלות קבצים מסוג JPG, PNG או WEBP בלבד";
    }

    if (file.size > IMAGE_MAX_BYTES) {
        return "גודל התמונה המקסימלי הוא 5MB";
    }

    return null;
}

function sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadImageFile(file, storageFolder, entityId) {
    const validationError = validateImageFile(file);

    if (validationError) {
        throw new Error(validationError);
    }

    const folderId = entityId || crypto.randomUUID();
    const storageRef = ref(
        storage,
        `${storageFolder}/${folderId}/${Date.now()}-${sanitizeFileName(file.name)}`
    );

    await uploadBytes(storageRef, file, {
        contentType: file.type
    });

    return getDownloadURL(storageRef);
}
