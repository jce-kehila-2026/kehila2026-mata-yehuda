import { useEffect, useState } from "react";
import {
    fetchPrograms,
    addProgram,
    updateProgram,
    deleteProgram,
    DAY_CENTER_ID
} from "../services/programService";
import ProgramForm from "../components/programs/ProgramForm";
import ProgramList from "../components/programs/ProgramList";

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

            <ProgramForm
                title={title}
                description={description}
                imageUrl={imageUrl}
                editingId={editingId}
                saving={saving}
                error={error}
                success={success}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onImageUrlChange={setImageUrl}
                onSave={handleSave}
                onCancelEdit={handleCancelEdit}
            />

            <ProgramList
                programs={programs}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}

export default ManagePrograms;
