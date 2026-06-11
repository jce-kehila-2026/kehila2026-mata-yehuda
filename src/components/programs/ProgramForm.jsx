import { useEffect, useRef, useState } from "react";
import FormImageUpload from "../shared/FormImageUpload";
import FormActionRow from "../shared/FormActionRow";
import { prepareProgramImageUrl } from "../../services/staffManegmentServices/programImageService";
import {
    formatProgramTitle,
    isFixedProgramId
} from "../../utils/staffManegmentUtils/programConstants";

function ProgramForm({
    editingProgram,
    onSubmit,
    onCancelEdit,
    formError = "",
    formSuccess = ""
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const imageUploadRef = useRef(null);

    const isFixedProgram = Boolean(
        editingProgram && isFixedProgramId(editingProgram.id)
    );

    useEffect(() => {
        if (editingProgram) {
            setTitle(formatProgramTitle(editingProgram));
            setDescription(editingProgram.description || "");
        } else {
            setTitle("");
            setDescription("");
        }

        setSubmitError("");
    }, [editingProgram]);

    async function handleSubmit() {
        if (!isFixedProgram && !title.trim()) {
            setSubmitError("יש להזין כותרת");
            return;
        }

        if (imageUploadRef.current?.hasError()) {
            setSubmitError(
                imageUploadRef.current.getError() || "שגיאה בבחירת התמונה"
            );
            return;
        }

        setIsUploading(true);
        setSubmitError("");

        try {
            const imageUrl = await imageUploadRef.current.resolveImageUrl();

            await onSubmit({
                title: isFixedProgram
                    ? formatProgramTitle(editingProgram)
                    : title.trim(),
                description: description.trim(),
                image_url: imageUrl || ""
            });
        } catch (error) {
            console.error("Program save failed:", error);
            setSubmitError(error?.message || "שגיאה בשמירת התוכנית");
        } finally {
            setIsUploading(false);
        }
    }

    const displayError = submitError || formError;

    return (
        <div className="staff-form">
            {displayError ? (
                <p className="staff-alert staff-alert--error">{displayError}</p>
            ) : null}
            {formSuccess ? (
                <p className="staff-alert staff-alert--success">{formSuccess}</p>
            ) : null}

            <label htmlFor="program-title">כותרת</label>
            <input
                id="program-title"
                type="text"
                placeholder="שם התוכנית"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isFixedProgram || isUploading}
            />
            {isFixedProgram ? (
                <p className="program-form__fixed-note">
                    כותרת תוכנית מערכת אינה ניתנת לעריכה
                </p>
            ) : null}

            <label htmlFor="program-description">תיאור</label>
            <textarea
                id="program-description"
                placeholder="תיאור התוכנית"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isUploading}
            />

            <FormImageUpload
                ref={imageUploadRef}
                idPrefix="program-image"
                label="תמונת תוכנית"
                previewAlt={title || "תצוגה מקדימה של תמונת התוכנית"}
                initialImageUrl={editingProgram?.image_url || ""}
                disabled={isUploading}
                allowManualUrl
                onUpload={prepareProgramImageUrl}
            />

            <FormActionRow
                submitLabel={
                    isUploading
                        ? "שומר..."
                        : editingProgram
                          ? "שמירת שינויים"
                          : "הוספת תוכנית"
                }
                onSubmit={handleSubmit}
                onCancel={editingProgram ? onCancelEdit : undefined}
                isSubmitting={isUploading}
            />
        </div>
    );
}

export default ProgramForm;
