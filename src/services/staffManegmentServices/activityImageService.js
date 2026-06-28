import {
    IMAGE_ACCEPT,
    IMAGE_MAX_BYTES,
    fileToCompressedDataUrl,
    validateImageFile
} from "./imageDataUrlService";

export const ACTIVITY_IMAGE_MAX_BYTES = IMAGE_MAX_BYTES;
export const ACTIVITY_IMAGE_ACCEPT = IMAGE_ACCEPT;

export const validateActivityImageFile = validateImageFile;

/** Converts a selected image file to a compressed Base64 data URL for Firestore. */
export async function prepareActivityImageUrl(file) {
    return fileToCompressedDataUrl(file);
}
