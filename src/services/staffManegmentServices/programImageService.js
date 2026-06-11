import {
    IMAGE_ACCEPT,
    IMAGE_MAX_BYTES,
    fileToCompressedDataUrl,
    validateImageFile
} from "./imageDataUrlService";

export const PROGRAM_IMAGE_ACCEPT = IMAGE_ACCEPT;
export const PROGRAM_IMAGE_MAX_BYTES = IMAGE_MAX_BYTES;

export const validateProgramImageFile = validateImageFile;

/** Converts a selected image file to a compressed Base64 data URL for Firestore. */
export async function prepareProgramImageUrl(file) {
    return fileToCompressedDataUrl(file);
}
