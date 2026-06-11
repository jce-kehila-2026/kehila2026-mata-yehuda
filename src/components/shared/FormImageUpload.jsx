import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";
import { ImageUp, Pencil, Trash2 } from "lucide-react";
import { IMAGE_ACCEPT, validateImageFile } from "../../utils/staffManegmentUtils/imageFileUtils";

function FormImageUpload(
    {
        label = "תמונה",
        idPrefix = "form-image",
        previewAlt = "תצוגה מקדימה",
        initialImageUrl = "",
        disabled = false,
        allowManualUrl = false,
        onUpload
    },
    ref
) {
    const [savedImageUrl, setSavedImageUrl] = useState(initialImageUrl);
    const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
    const [manualUrl, setManualUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageFileName, setImageFileName] = useState(
        initialImageUrl ? "תמונה קיימת" : ""
    );
    const [imageError, setImageError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const localPreviewRef = useRef("");
    const fileInputRef = useRef(null);

    function clearLocalPreview() {
        if (localPreviewRef.current) {
            URL.revokeObjectURL(localPreviewRef.current);
            localPreviewRef.current = "";
        }
    }

    function resetImageState(existingUrl = "") {
        clearLocalPreview();
        setSavedImageUrl(existingUrl);
        setPreviewUrl(existingUrl);
        setManualUrl("");
        setSelectedFile(null);
        setImageFileName(existingUrl ? "תמונה קיימת" : "");
        setImageError("");
    }

    useEffect(() => {
        resetImageState(initialImageUrl || "");
    }, [initialImageUrl]);

    useEffect(() => {
        return () => {
            clearLocalPreview();
        };
    }, []);

    function restoreExistingImagePreview() {
        clearLocalPreview();
        setPreviewUrl(savedImageUrl);
        setImageFileName(savedImageUrl ? "תמונה קיימת" : "");
        setSelectedFile(null);
        setManualUrl("");
    }

    function processImageFile(file, inputElement = null) {
        if (!file) {
            return;
        }

        const validationError = validateImageFile(file);

        if (validationError) {
            setImageError(validationError);
            restoreExistingImagePreview();

            if (inputElement) {
                inputElement.value = "";
            }

            return;
        }

        clearLocalPreview();
        const objectUrl = URL.createObjectURL(file);
        localPreviewRef.current = objectUrl;

        setSelectedFile(file);
        setManualUrl("");
        setImageFileName(file.name);
        setPreviewUrl(objectUrl);
        setImageError("");
    }

    function handleManualUrlChange(event) {
        const nextUrl = event.target.value;
        setManualUrl(nextUrl);
        setImageError("");

        if (nextUrl.trim()) {
            clearLocalPreview();
            setSelectedFile(null);
            setPreviewUrl(nextUrl);
            setImageFileName("קישור חיצוני");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        if (savedImageUrl) {
            setPreviewUrl(savedImageUrl);
            setImageFileName("תמונה קיימת");
        } else {
            setPreviewUrl("");
            setImageFileName("");
        }
    }

    function handleImageFileChange(event) {
        processImageFile(event.target.files?.[0], event.target);
    }

    function handleDropZoneClick() {
        if (disabled) {
            return;
        }

        fileInputRef.current?.click();
    }

    function handleDropZoneKeyDown(event) {
        if (disabled) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleDropZoneClick();
        }
    }

    function handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();

        if (disabled) {
            return;
        }

        setIsDragOver(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.contains(event.relatedTarget)) {
            return;
        }

        setIsDragOver(false);
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    function handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);

        if (disabled) {
            return;
        }

        processImageFile(event.dataTransfer.files?.[0]);
    }

    function handleReplaceImage(event) {
        event.preventDefault();
        event.stopPropagation();
        handleDropZoneClick();
    }

    function handleRemoveImage(event) {
        event?.preventDefault?.();
        event?.stopPropagation?.();

        clearLocalPreview();
        setSavedImageUrl("");
        setPreviewUrl("");
        setManualUrl("");
        setSelectedFile(null);
        setImageFileName("");
        setImageError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    useImperativeHandle(ref, () => ({
        async resolveImageUrl() {
            if (imageError) {
                throw new Error(imageError);
            }

            if (selectedFile) {
                if (typeof onUpload !== "function") {
                    throw new Error("Image conversion handler is missing");
                }

                try {
                    return await onUpload(selectedFile);
                } catch (error) {
                    console.error("[FormImageUpload] image conversion failed:", error);
                    throw error;
                }
            }

            const trimmedManualUrl = manualUrl.trim();

            if (trimmedManualUrl) {
                return trimmedManualUrl;
            }

            if (!previewUrl) {
                return "";
            }

            return savedImageUrl;
        },
        hasError() {
            return Boolean(imageError);
        },
        getError() {
            return imageError;
        }
    }));

    const labelId = `${idPrefix}-label`;
    const hintId = `${idPrefix}-hint`;
    const inputId = `${idPrefix}-input`;
    const manualUrlId = `${idPrefix}-manual-url`;

    return (
        <div className="form-image-upload">
            <span id={labelId} className="form-image-upload__label">
                {label}
            </span>

            <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                className="form-image-upload__input"
                accept={IMAGE_ACCEPT}
                onChange={handleImageFileChange}
                disabled={disabled}
            />

            {previewUrl ? (
                <div className="form-image-upload__preview-block">
                    <img
                        src={previewUrl}
                        alt={previewAlt}
                        className="form-image-upload__preview"
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                        }}
                    />

                    {imageFileName ? (
                        <p className="form-image-upload__filename">{imageFileName}</p>
                    ) : null}

                    <div className="form-image-upload__actions">
                        <button
                            type="button"
                            className="form-image-upload__action form-image-upload__action--replace"
                            onClick={handleReplaceImage}
                            disabled={disabled}
                            title="החלף תמונה"
                            aria-label="החלף תמונה"
                        >
                            <Pencil
                                className="form-image-upload__action-icon"
                                size={17}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                            <span className="form-image-upload__action-label">
                                החלף תמונה
                            </span>
                        </button>

                        <button
                            type="button"
                            className="form-image-upload__action form-image-upload__action--remove"
                            onClick={handleRemoveImage}
                            disabled={disabled}
                            title="הסר תמונה"
                            aria-label="הסר תמונה"
                        >
                            <Trash2
                                className="form-image-upload__action-icon"
                                size={17}
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                            <span className="form-image-upload__action-label">
                                הסר תמונה
                            </span>
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={[
                        "form-image-upload__dropzone",
                        isDragOver && "form-image-upload__dropzone--active",
                        imageError && "form-image-upload__dropzone--error",
                        disabled && "form-image-upload__dropzone--disabled"
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-labelledby={labelId}
                    aria-describedby={hintId}
                    aria-disabled={disabled}
                    onClick={handleDropZoneClick}
                    onKeyDown={handleDropZoneKeyDown}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <ImageUp
                        className="form-image-upload__icon"
                        aria-hidden="true"
                        size={32}
                        strokeWidth={1.75}
                    />

                    <p className="form-image-upload__prompt">
                        גררי תמונה לכאן או לחצי לבחירת קובץ
                    </p>

                    <p id={hintId} className="form-image-upload__hint">
                        JPG, PNG, WEBP · עד 5MB · יידחס ל-800px
                    </p>
                </div>
            )}

            {allowManualUrl ? (
                <>
                    <label htmlFor={manualUrlId}>או קישור לתמונה</label>
                    <input
                        id={manualUrlId}
                        type="url"
                        className="form-image-upload__manual-url"
                        placeholder="https://..."
                        value={manualUrl}
                        onChange={handleManualUrlChange}
                        disabled={disabled}
                    />
                </>
            ) : null}

            {imageError ? (
                <p className="form-image-upload__error">{imageError}</p>
            ) : null}
        </div>
    );
}

export default forwardRef(FormImageUpload);
