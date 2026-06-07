import {
    IMAGE_ACCEPT,
    IMAGE_MAX_BYTES,
    uploadImageFile,
    validateImageFile
} from "./imageUploadService";

export const PROGRAM_IMAGE_ACCEPT = IMAGE_ACCEPT;
export const PROGRAM_IMAGE_MAX_BYTES = IMAGE_MAX_BYTES;

export const validateProgramImageFile = validateImageFile;

export async function uploadProgramImage(file, programId) {
    return uploadImageFile(file, "programs", programId);
}
