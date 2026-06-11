import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage, STORAGE_BUCKET } from "../config/firebase";
import {
    IMAGE_ACCEPT,
    IMAGE_MAX_BYTES,
    validateImageFile
} from "../utils/imageFileUtils";

export { IMAGE_ACCEPT, IMAGE_MAX_BYTES, validateImageFile };

export const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

const LOG_PREFIX = "[imageUpload]";

function logStep(step, details = {}) {
    console.info(LOG_PREFIX, step, {
        bucket: STORAGE_BUCKET,
        ...details
    });
}

function logError(step, error, details = {}) {
    console.error(LOG_PREFIX, step, {
        bucket: STORAGE_BUCKET,
        error,
        errorCode: error?.code,
        errorMessage: error?.message,
        serverResponse: error?.customData?.serverResponse,
        ...details
    });
}

function sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function withUploadTimeout(promise, timeoutMs = IMAGE_UPLOAD_TIMEOUT_MS) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(
                    new Error(
                        "העלאת התמונה נכשלה – חיבור לשרת האחסון לא הגיב בזמן."
                    )
                );
            }, timeoutMs);
        })
    ]);
}

export function formatStorageUploadError(error) {
    const code = error?.code || "";

    switch (code) {
        case "storage/unauthorized":
            return "אין הרשאה להעלות תמונה. ודאו שאתם מחוברים כאיש צוות.";
        case "storage/unauthenticated":
            return "יש להתחבר מחדש לפני העלאת תמונה.";
        case "storage/canceled":
            return "העלאת התמונה בוטלה.";
        case "storage/quota-exceeded":
            return "מכסת האחסון מלאה. פנו למנהל המערכת.";
        case "storage/retry-limit-exceeded":
            return "העלאת התמונה נכשלה לאחר מספר ניסיונות. נסו שוב.";
        case "storage/invalid-checksum":
        case "storage/invalid-format":
        case "storage/invalid-argument":
            return "קובץ התמונה אינו תקין. נסו קובץ אחר.";
        case "storage/object-not-found":
        case "storage/bucket-not-found":
            return "שירות האחסון אינו זמין בפרויקט.";
        case "storage/unknown":
        default:
            return error?.message || "העלאת התמונה נכשלה.";
    }
}

/** Activity uploads only — programs use Base64 via imageDataUrlService. */
export async function uploadImageFile(file, storageFolder, entityId) {
    const validationError = validateImageFile(file);

    if (validationError) {
        throw new Error(validationError);
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("יש להתחבר מחדש לפני העלאת תמונה.");
    }

    const folderId = entityId || crypto.randomUUID();
    const objectPath = `${storageFolder}/${folderId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const storageRef = ref(storage, objectPath);

    logStep("before upload", { objectPath, userId: currentUser.uid });

    try {
        await withUploadTimeout(
            uploadBytes(storageRef, file, {
                contentType: file.type || "application/octet-stream"
            })
        );

        logStep("before getDownloadURL", { objectPath });

        const downloadUrl = await withUploadTimeout(getDownloadURL(storageRef), 30_000);

        logStep("after getDownloadURL", { objectPath });

        return downloadUrl;
    } catch (error) {
        logError("upload failed", error, { objectPath });
        throw new Error(formatStorageUploadError(error));
    }
}
