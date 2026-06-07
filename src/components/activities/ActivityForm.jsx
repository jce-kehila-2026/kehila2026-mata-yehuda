import { useEffect, useMemo, useRef, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { ImageUp, Pencil, Trash2 } from "lucide-react";
import {
    ACTIVITY_IMAGE_ACCEPT,
    uploadActivityImage,
    validateActivityImageFile
} from "../../services/activityImageService";
import FormActionRow from "../shared/FormActionRow";
import { getDayOfWeekFromActivityDate, parseLocalDateInput } from "../../utils/dateUtils";
import {
    getRegistrationAvailabilityLabel,
    isRegistrationOpenForDeadlineInput,
    REGISTRATION_AVAILABILITY_LABELS
} from "../../utils/activityStatus";

function ActivityForm({
    activityTypes,
    onSubmit,
    editingActivity,
    onCancelEdit
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [savedImageUrl, setSavedImageUrl] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageFileName, setImageFileName] = useState("");
    const [imageError, setImageError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [registrationDeadLine, setRegistrationDeadLine] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [price, setPrice] = useState(0);
    const [priceNote, setPriceNote] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const localPreviewRef = useRef("");
    const fileInputRef = useRef(null);

    function formatDate(value) {
        if (!value) return "";

        if (value.toDate) {
            return value.toDate().toISOString().split("T")[0];
        }

        if (value.seconds) {
            return new Date(value.seconds * 1000).toISOString().split("T")[0];
        }

        return value;
    }

    function formatTime(value) {
        if (!value) return "";

        let date;

        if (value.toDate) {
            date = value.toDate();
        } else if (value.seconds) {
            date = new Date(value.seconds * 1000);
        } else {
            return value;
        }

        return date.toTimeString().slice(0, 5);
    }

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
        setSelectedFile(null);
        setImageFileName(existingUrl ? "תמונה קיימת" : "");
        setImageError("");
    }

    function resetFormFields() {
        setName("");
        setDescription("");
        resetImageState("");
        setStartDate("");
        setRegistrationDeadLine("");
        setStartTime("");
        setEndTime("");
        setMaxParticipants(0);
        setPrice(0);
        setPriceNote("");
    }

    useEffect(() => {
        if (editingActivity) {
            setName(editingActivity.data.name || "");
            setDescription(editingActivity.data.description || "");
            resetImageState(editingActivity.data.image_url || "");

            setStartDate(formatDate(editingActivity.data.start_date));
            setRegistrationDeadLine(
                formatDate(editingActivity.data.registration_deadline)
            );
            setStartTime(formatTime(editingActivity.data.start_date));
            setEndTime(formatTime(editingActivity.data.end_date));

            setMaxParticipants(editingActivity.data.max_participants || 0);
            setPrice(editingActivity.data.price || 0);
            setPriceNote(editingActivity.data.price_note || "");
        } else {
            resetFormFields();
        }
    }, [editingActivity]);

    const registrationStatusLabel = useMemo(() => {
        if (registrationDeadLine) {
            return getRegistrationAvailabilityLabel({
                registration_deadline: parseLocalDateInput(registrationDeadLine)
            });
        }

        if (editingActivity?.data) {
            return getRegistrationAvailabilityLabel(editingActivity.data);
        }

        return REGISTRATION_AVAILABILITY_LABELS.unknown;
    }, [registrationDeadLine, editingActivity]);

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
    }

    function processImageFile(file, inputElement = null) {
        if (!file) {
            return;
        }

        const validationError = validateActivityImageFile(file);

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
        setImageFileName(file.name);
        setPreviewUrl(objectUrl);
        setImageError("");
    }

    function handleImageFileChange(event) {
        processImageFile(event.target.files?.[0], event.target);
    }

    function handleDropZoneClick() {
        fileInputRef.current?.click();
    }

    function handleDropZoneKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleDropZoneClick();
        }
    }

    function handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
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
        processImageFile(event.dataTransfer.files?.[0]);
    }

    function handleReplaceImage(event) {
        event.preventDefault();
        event.stopPropagation();
        fileInputRef.current?.click();
    }

    function handleRemoveImage(event) {
        event?.preventDefault?.();
        event?.stopPropagation?.();

        clearLocalPreview();
        setSavedImageUrl("");
        setPreviewUrl("");
        setSelectedFile(null);
        setImageFileName("");
        setImageError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function handleCancel() {
        resetFormFields();
        onCancelEdit();
    }

    async function handleSubmit() {
        if (!name || !startDate || !startTime || !endTime || !registrationDeadLine) {
            alert("נא למלא שם פעילות, תאריך, שעות ותאריך אחרון להרשמה");
            return;
        }

        if (imageError) {
            return;
        }

        setIsUploading(true);

        try {
            let imageUrl = savedImageUrl;

            if (selectedFile) {
                imageUrl = await uploadActivityImage(
                    selectedFile,
                    editingActivity?.id
                );
            } else if (!previewUrl) {
                imageUrl = "";
            }

            const activityData = {
                name,
                description,
                image_url: imageUrl || "",

                start_date: Timestamp.fromDate(
                    new Date(`${startDate}T${startTime}`)
                ),
                end_date: Timestamp.fromDate(new Date(`${startDate}T${endTime}`)),
                registration_deadline: Timestamp.fromDate(
                    new Date(`${registrationDeadLine}T23:59`)
                ),

                day_of_week: getDayOfWeekFromActivityDate(startDate, startTime),
                max_participants: Number(maxParticipants),
                current_participants: editingActivity
                    ? editingActivity.data.current_participants || 0
                    : 0,
                price: Number(price),
                price_note: priceNote,
                is_open: isRegistrationOpenForDeadlineInput(registrationDeadLine)
            };

            if (!editingActivity) {
                activityData.created_at = Timestamp.now();
            } else if (editingActivity.data?.created_at) {
                activityData.created_at = editingActivity.data.created_at;
            }

            await onSubmit(activityData);
            resetFormFields();
        } catch (error) {
            console.error("Activity image upload failed:", error);
            setImageError(error.message || "שגיאה בהעלאת התמונה");
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="staff-form">
            <label>שם הפעולה</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <label>תיאור</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <div className="activity-form-image-upload">
                <span
                    id="activity-image-upload-label"
                    className="activity-form-image-upload__label"
                >
                    תמונת פעילות
                </span>

                <input
                    ref={fileInputRef}
                    id="activity-image-upload"
                    type="file"
                    className="activity-form-image-upload__input"
                    accept={ACTIVITY_IMAGE_ACCEPT}
                    onChange={handleImageFileChange}
                />

                {previewUrl ? (
                    <div className="activity-form-image-upload__preview-block">
                        <img
                            src={previewUrl}
                            alt={name || "תצוגה מקדימה של תמונת הפעילות"}
                            className="activity-form-image-upload__preview"
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />

                        {imageFileName ? (
                            <p className="activity-form-image-upload__filename">
                                {imageFileName}
                            </p>
                        ) : null}

                        <div className="activity-form-image-upload__actions">
                            <button
                                type="button"
                                className="activity-form-image-upload__action activity-form-image-upload__action--replace"
                                onClick={handleReplaceImage}
                                disabled={isUploading}
                                title="החלף תמונה"
                                aria-label="החלף תמונה"
                            >
                                <Pencil
                                    className="activity-form-image-upload__action-icon"
                                    size={17}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                <span className="activity-form-image-upload__action-label">
                                    החלף תמונה
                                </span>
                            </button>

                            <button
                                type="button"
                                className="activity-form-image-upload__action activity-form-image-upload__action--remove"
                                onClick={handleRemoveImage}
                                disabled={isUploading}
                                title="הסר תמונה"
                                aria-label="הסר תמונה"
                            >
                                <Trash2
                                    className="activity-form-image-upload__action-icon"
                                    size={17}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                <span className="activity-form-image-upload__action-label">
                                    הסר תמונה
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={[
                            "activity-form-image-upload__dropzone",
                            isDragOver &&
                                "activity-form-image-upload__dropzone--active",
                            imageError &&
                                "activity-form-image-upload__dropzone--error"
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        role="button"
                        tabIndex={0}
                        aria-labelledby="activity-image-upload-label"
                        aria-describedby="activity-image-upload-hint"
                        onClick={handleDropZoneClick}
                        onKeyDown={handleDropZoneKeyDown}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <ImageUp
                            className="activity-form-image-upload__icon"
                            aria-hidden="true"
                            size={32}
                            strokeWidth={1.75}
                        />

                        <p className="activity-form-image-upload__prompt">
                            גררי תמונה לכאן או לחצי לבחירת קובץ
                        </p>

                        <p
                            id="activity-image-upload-hint"
                            className="activity-form-image-upload__hint"
                        >
                            JPG, PNG, WEBP · עד 5MB
                        </p>
                    </div>
                )}

                {imageError ? (
                    <p className="activity-form-image-upload__error">{imageError}</p>
                ) : null}
            </div>

            <label>תאריך הפעולה</label>
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />

            <label>מספר משתתפים מקסימלי</label>
            <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
            />

            <label>תאריך אחרון להרשמה</label>
            <input
                type="date"
                value={registrationDeadLine}
                onChange={(e) => setRegistrationDeadLine(e.target.value)}
            />
            <p className="activity-form-registration-status">
                סטטוס הרשמה: {registrationStatusLabel}
            </p>

            <label>שעת התחלה</label>
            <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
            />

            <label>שעת סיום</label>
            <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
            />

            <label>מחיר</label>
            <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />

            <label>הערת מחיר</label>
            <input
                type="text"
                value={priceNote}
                onChange={(e) => setPriceNote(e.target.value)}
            />

            <FormActionRow
                submitLabel={
                    isUploading
                        ? "מעלה תמונה..."
                        : editingActivity
                          ? "שמירת שינויים"
                          : "הוספת פעילות"
                }
                onSubmit={handleSubmit}
                onCancel={editingActivity ? handleCancel : undefined}
                isSubmitting={isUploading}
            />
        </div>
    );
}

export default ActivityForm;
