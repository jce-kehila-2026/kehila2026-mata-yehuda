function ProgramForm({
    title,
    description,
    imageUrl,
    editingId,
    saving,
    error,
    success,
    onTitleChange,
    onDescriptionChange,
    onImageUrlChange,
    onSave,
    onCancelEdit
}) {
    return (
        <div className="staff-form">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <label htmlFor="program-title">כותרת</label>
            <input
                id="program-title"
                type="text"
                placeholder="שם התוכנית"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
            />

            <label htmlFor="program-description">תיאור</label>
            <textarea
                id="program-description"
                placeholder="תיאור התוכנית"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
            />

            <label htmlFor="program-image-url">קישור לתמונה</label>
            <input
                id="program-image-url"
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => onImageUrlChange(e.target.value)}
            />

            {imageUrl.trim() && (
                <img
                    src={imageUrl}
                    alt="תצוגה מקדימה"
                    className="day-center-preview"
                    onError={(e) => {
                        e.target.style.display = "none";
                    }}
                    onLoad={(e) => {
                        e.target.style.display = "block";
                    }}
                />
            )}

            <button onClick={onSave} disabled={saving}>
                {saving
                    ? "שומר..."
                    : editingId
                        ? "עדכון תוכנית"
                        : "הוספת תוכנית"}
            </button>

            {editingId && (
                <button type="button" onClick={onCancelEdit}>
                    ביטול עריכה
                </button>
            )}
        </div>
    );
}

export default ProgramForm;
