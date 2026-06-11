import { validateImageFile } from "../../utils/staffManegmentUtils/imageFileUtils";

export { IMAGE_ACCEPT, IMAGE_MAX_BYTES, validateImageFile } from "../../utils/staffManegmentUtils/imageFileUtils";

/** Max width after resize before JPEG compression. */
export const IMAGE_MAX_WIDTH = 800;

/** JPEG quality passed to canvas.toDataURL. */
export const IMAGE_JPEG_QUALITY = 0.7;

/**
 * Firestore document limit is 1 MiB. Keep image_url well below that so other
 * fields in the same document can fit.
 */
export const MAX_DATA_URL_LENGTH = 750_000;

export async function fileToCompressedDataUrl(file) {
    const validationError = validateImageFile(file);

    if (validationError) {
        throw new Error(validationError);
    }

    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);

            try {
                let { width, height } = image;

                if (width > IMAGE_MAX_WIDTH) {
                    height = Math.round((height * IMAGE_MAX_WIDTH) / width);
                    width = IMAGE_MAX_WIDTH;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");

                if (!context) {
                    reject(new Error("המרת התמונה נכשלה. נסו קובץ אחר."));
                    return;
                }

                context.drawImage(image, 0, 0, width, height);

                const dataUrl = canvas.toDataURL("image/jpeg", IMAGE_JPEG_QUALITY);

                if (dataUrl.length > MAX_DATA_URL_LENGTH) {
                    reject(
                        new Error(
                            "התמונה גדולה מדי לשמירה במסמך. נסו תמונה קטנה יותר."
                        )
                    );
                    return;
                }

                resolve(dataUrl);
            } catch (error) {
                console.error("[imageDataUrl] conversion failed:", error);
                reject(new Error("המרת התמונה נכשלה. נסו קובץ אחר."));
            }
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("המרת התמונה נכשלה. נסו קובץ אחר."));
        };

        image.src = objectUrl;
    });
}
