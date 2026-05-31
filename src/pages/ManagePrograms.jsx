import { useEffect, useState } from "react";
import {
    fetchPrograms,
    addProgram,
    updateProgram,
    deleteProgram,
    DAY_CENTER_ID,
    isDayCenterEntry
} from "../services/programService";

function ManagePrograms() {
    const [programs, setPrograms] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function resetForm() {
        setTitle("");
        setDescription("");
        setImageUrl("");
        setEditingId(null);
    }

    function fillForm(program) {
        setTitle(program.title || "");
        setDescription(program.description || "");
        setImageUrl(program.image_url || "");
        setEditingId(program.id);
    }

    async function loadPrograms() {
        setLoading(true);
        setError("");
        try {
            const data = await fetchPrograms();
            setPrograms(data);
        } catch (err) {
            console.log(err);
            setError("שגיאה בטעינת התוכניות");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPrograms();
    }, []);

    function validateForm() {
        if (!title.trim()) {
            setError("יש להזין כותרת");
            setSuccess("");
            return false;
        }
        setError("");
        return true;
    }

    async function handleSave() {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setSuccess("");

        const programData = {
            title,
            description,
            image_url: imageUrl
        };

        try {
            if (editingId) {
                await updateProgram(editingId, programData);
                setSuccess(
                    editingId === DAY_CENTER_ID
                        ? "מרכז היום עודכן בהצלחה"
                        : "התוכנית עודכנה בהצלחה"
                );
            } else {
                await addProgram(programData);
                setSuccess("התוכנית נוספה בהצלחה");
            }

            resetForm();
            await loadPrograms();
        } catch (err) {
            console.log(err);
            setError(editingId ? "שגיאה בעדכון התוכנית" : "שגיאה בהוספת התוכנית");
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(program) {
        fillForm(program);
        setError("");
        setSuccess("");
    }

    function handleCancelEdit() {
        resetForm();
        setError("");
        setSuccess("");
    }

    async function handleDelete(programId) {
        const confirmed = window.confirm("האם למחוק תוכנית זו?");
        if (!confirmed) {
            return;
        }

        try {
            await deleteProgram(programId);
            if (editingId === programId) {
                resetForm();
            }
            setSuccess("התוכנית נמחקה בהצלחה");
            setError("");
            await loadPrograms();
        } catch (err) {
            console.log(err);
            setError("שגיאה במחיקת התוכנית");
        }
    }

    return (
        <div>
            <h1>
                {editingId === DAY_CENTER_ID
                    ? "עריכת מרכז יום"
                    : editingId
                        ? "עריכת תוכנית"
                        : "הוספת תוכנית חדשה"}
            </h1>

            <div className="staff-form">
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <label htmlFor="program-title">כותרת</label>
                <input
                    id="program-title"
                    type="text"
                    placeholder="שם התוכנית"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label htmlFor="program-description">תיאור</label>
                <textarea
                    id="program-description"
                    placeholder="תיאור התוכנית"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label htmlFor="program-image-url">קישור לתמונה</label>
                <input
                    id="program-image-url"
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
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

                <button onClick={handleSave} disabled={saving}>
                    {saving
                        ? "שומר..."
                        : editingId
                            ? "עדכון תוכנית"
                            : "הוספת תוכנית"}
                </button>

                {editingId && (
                    <button type="button" onClick={handleCancelEdit}>
                        ביטול עריכה
                    </button>
                )}
            </div>

            <h2>רשימת תוכניות</h2>

            {loading && <p>טוען...</p>}

            {!loading && programs.length === 0 && (
                <p>אין תוכניות במערכת</p>
            )}

            {programs.map((program) => {
                const isDayCenter = isDayCenterEntry(program);

                return (
                    <div
                        key={program.id}
                        className={`staff-card${isDayCenter ? " staff-card-day-center" : ""}`}
                    >
                        <h3>{program.title}</h3>
                        <p>{program.description || "—"}</p>

                        {program.image_url && (
                            <img
                                src={program.image_url}
                                alt={program.title}
                                className="day-center-preview"
                            />
                        )}

                        <div className="row">
                            <button onClick={() => handleEdit(program)}>
                                עריכה
                            </button>
                            {!isDayCenter && (
                                <button onClick={() => handleDelete(program.id)}>
                                    מחיקה
                                </button>
                            )}
                        </div>
                        <hr />
                    </div>
                );
            })}
        </div>
    );
}

export default ManagePrograms;
