import { useEffect, useState } from "react";
import {
    fetchDayCenter,
    saveDayCenter
} from "../services/programService";

function ManageDayCenter() {
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadDayCenter() {
            setLoading(true);
            setError("");
            try {
                const data = await fetchDayCenter();
                setDescription(data.description);
                setImageUrl(data.image_url);
            } catch (err) {
                console.log(err);
                setError("שגיאה בטעינת נתוני מרכז היום");
            } finally {
                setLoading(false);
            }
        }

        loadDayCenter();
    }, []);

    async function handleSave() {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await saveDayCenter({
                description,
                image_url: imageUrl
            });
            setSuccess("נתוני מרכז היום נשמרו בהצלחה");
        } catch (err) {
            console.log(err);
            setError("שגיאה בשמירת נתוני מרכז היום");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>טוען...</p>;
    }

    return (
        <div>
            <h1>ניהול מרכז יום</h1>

            <div className="staff-form">
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <label htmlFor="day-center-description">תיאור</label>
                <textarea
                    id="day-center-description"
                    placeholder="תיאור מרכז היום"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label htmlFor="day-center-image-url">קישור לתמונה</label>
                <input
                    id="day-center-image-url"
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
                    {saving ? "שומר..." : "שמירה"}
                </button>
            </div>
        </div>
    );
}

export default ManageDayCenter;
