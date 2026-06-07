import {
    IMAGE_ACCEPT,
    IMAGE_MAX_BYTES,
    uploadImageFile,
    validateImageFile
} from "./imageUploadService";

export const ACTIVITY_IMAGE_MAX_BYTES = IMAGE_MAX_BYTES;
export const ACTIVITY_IMAGE_ACCEPT = IMAGE_ACCEPT;

export const validateActivityImageFile = validateImageFile;

export async function uploadActivityImage(file, activityId) {
    return uploadImageFile(file, "activities", activityId);
}
