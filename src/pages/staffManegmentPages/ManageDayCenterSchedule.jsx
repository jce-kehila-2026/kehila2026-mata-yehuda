import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUp, Pencil } from "lucide-react";
import {
    IMAGE_ACCEPT,
    validateImageFile
} from "../../services/staffManegmentServices/imageUploadService";
import { prepareProgramImageUrl } from "../../services/staffManegmentServices/programImageService";
import {
    fetchDayCenterScheduleImageUrl,
    updateDayCenterScheduleImageUrl
} from "../../services/staffManegmentServices/dayCenterScheduleService";

function ManageDayCenterSchedule() {
    const [savedImageUrl, setSavedImageUrl] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageFileName, setImageFileName] = useState("");
    const [imageError, setImageError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);
    const localPreviewRef = useRef("");

    const clearLocalPreview = useCallback(() => {
        if (localPreviewRef.current) {
            URL.revokeObjectURL(localPreviewRef.current);
            localPreviewRef.current = "";
        }
    }, []);

    const loadSchedule = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const imageUrl = await fetchDayCenterScheduleImageUrl();
            setSavedImageUrl(imageUrl);
            setPreviewUrl(imageUrl);
            setImageFileName(imageUrl ? "תמונה שמורה" : "");
        } catch (loadError) {
            console.error(loadError);
            setError("שגיאה בטעינת לוח הזמנים");
            setSavedImageUrl("");
            setPreviewUrl("");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);

    useEffect(() => {
        return () => {
            clearLocalPreview();
        };
    }, [clearLocalPreview]);

    function restoreSavedPreview() {
        clearLocalPreview();
        setPreviewUrl(savedImageUrl);
        setImageFileName(savedImageUrl ? "תמונה שמורה" : "");
        setSelectedFile(null);
    }

    function processImageFile(file) {
        if (!file) {
            return;
        }

        const validationError = validateImageFile(file);

        if (validationError) {
            setImageError(validationError);
            setSelectedFile(null);
            restoreSavedPreview();
            return;
        }

        clearLocalPreview();
        const objectUrl = URL.createObjectURL(file);
        localPreviewRef.current = objectUrl;

        setSelectedFile(file);
        setPreviewUrl(objectUrl);
        setImageFileName(file.name);
        setImageError("");
        setSuccess("");
        setError("");
    }

    function openFilePicker() {
        if (saving || deleting) {
            return;
        }

        fileInputRef.current?.click();
    }

    function handleFileChange(event) {
        processImageFile(event.target.files?.[0]);
        event.target.value = "";
    }

    function handleDropZoneClick() {
        openFilePicker();
    }

    function handleDropZoneKeyDown(event) {
        if (saving || deleting) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
        }
    }

    function handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();

        if (saving || deleting) {
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

        if (saving || deleting) {
            return;
        }

        processImageFile(event.dataTransfer.files?.[0]);
    }

    async function handleSave() {
        if (!selectedFile) {
            setError("יש לבחור תמונה לפני השמירה");
            return;
        }

        if (imageError) {
            setError(imageError);
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const dataUrl = await prepareProgramImageUrl(selectedFile);
            await updateDayCenterScheduleImageUrl(dataUrl);

            clearLocalPreview();
            setSavedImageUrl(dataUrl);
            setPreviewUrl(dataUrl);
            setSelectedFile(null);
            setImageFileName("תמונה שמורה");
            setSuccess("לוח הזמנים נשמר בהצלחה");
        } catch (saveError) {
            console.error(saveError);
            setError(saveError?.message || "שגיאה בשמירת לוח הזמנים");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!savedImageUrl) {
            return;
        }

        const confirmed = window.confirm("האם למחוק את תמונת לוח הזמנים?");
        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError("");
        setSuccess("");

        try {
            await updateDayCenterScheduleImageUrl("");

            clearLocalPreview();
            setSavedImageUrl("");
            setPreviewUrl("");
            setSelectedFile(null);
            setImageFileName("");
            setImageError("");
            setSuccess("התמונה נמחקה בהצלחה");
        } catch (deleteError) {
            console.error(deleteError);
            setError(deleteError?.message || "שגיאה במחיקת התמונה");
        } finally {
            setDeleting(false);
        }
    }

    const hasPreview = Boolean(previewUrl);
    const hasPendingUpload = Boolean(selectedFile);
    const hasSavedImage = Boolean(savedImageUrl);
    const isBusy = saving || deleting;

    if (loading) {
        return (
            <div className="staff-page staff-page--day-center-schedule">
                <div className="staff-container">
                    <p className="staff-loading">טוען...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-page staff-page--day-center-schedule">
            <div className="staff-container staff-container--day-center-schedule">
                <header className="staff-header day-center-schedule__header">
                    <h1>עדכון לוח זמנים למרכז יום</h1>
                    <p>
                        העלאת תמונת לוח הזמנים למרכז היום. התמונה נשמרת במערכת
                        לשימוש עתידי, ללא שינוי בשדות התוכנית האחרים.
                    </p>
                </header>

                {error ? (
                    <p className="staff-alert staff-alert--error">{error}</p>
                ) : null}
                {success ? (
                    <p className="staff-alert staff-alert--success">{success}</p>
                ) : null}

                <section className="staff-section staff-section--form day-center-schedule__form">
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="form-image-upload__input"
                        accept={IMAGE_ACCEPT}
                        onChange={handleFileChange}
                        disabled={isBusy}
                    />

                    {!hasPreview ? (
                        <div
                            className={[
                                "form-image-upload__dropzone",
                                "day-center-schedule__dropzone",
                                isDragOver && "form-image-upload__dropzone--active",
                                imageError && "form-image-upload__dropzone--error",
                                isBusy && "form-image-upload__dropzone--disabled"
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            role="button"
                            tabIndex={isBusy ? -1 : 0}
                            aria-label="גרירת תמונה או בחירת קובץ"
                            aria-disabled={isBusy}
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
                                גררי תמונה לכאן או לחצי לבחירה
                            </p>
                            <p className="form-image-upload__hint">
                                JPG, JPEG, PNG, WEBP · עד 5MB
                            </p>
                        </div>
                    ) : (
                        <div
                            className={[
                                "form-image-upload__preview-block",
                                "day-center-schedule__preview-block",
                                isDragOver &&
                                    "day-center-schedule__preview-block--drag-over"
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <img
                                src={previewUrl}
                                alt="תצוגה מקדימה של לוח זמנים מרכז יום"
                                className="form-image-upload__preview day-center-schedule__preview"
                            />
                            {imageFileName ? (
                                <p className="form-image-upload__filename">
                                    {imageFileName}
                                    {hasPendingUpload ? " · טרם נשמר" : ""}
                                </p>
                            ) : null}

                            <div className="form-image-upload__actions">
                                <button
                                    type="button"
                                    className="form-image-upload__action form-image-upload__action--replace"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        openFilePicker();
                                    }}
                                    disabled={isBusy}
                                    title="החלפת תמונה"
                                    aria-label="החלפת תמונה"
                                >
                                    <Pencil
                                        className="form-image-upload__action-icon"
                                        size={17}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                    <span className="form-image-upload__action-label">
                                        החלפת תמונה
                                    </span>
                                </button>
                            </div>

                            <p className="day-center-schedule__preview-hint">
                                ניתן לגרור תמונה חדשה לכאן להחלפה לפני השמירה
                            </p>
                        </div>
                    )}

                    {imageError ? (
                        <p className="form-image-upload__error">{imageError}</p>
                    ) : null}

                    <div className="staff-form__actions day-center-schedule__actions">
                        <button
                            type="button"
                            className="staff-button staff-form__submit"
                            onClick={handleSave}
                            disabled={isBusy || !hasPendingUpload}
                        >
                            {saving ? "שומר..." : "שמירת לוח זמנים"}
                        </button>
                        <button
                            type="button"
                            className="staff-button staff-button--secondary day-center-schedule__delete-btn"
                            onClick={handleDelete}
                            disabled={isBusy || !hasSavedImage}
                        >
                            {deleting ? "מוחק..." : "מחיקת תמונה"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ManageDayCenterSchedule;
