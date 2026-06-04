import { useEffect, useState } from "react";
import { buildStaffPage, staffNavigateBack } from "../utils/staffNavigation";
import {
    fetchPrograms,
    addProgram,
    updateProgram,
    deleteProgram
} from "../services/programService";
import {
    isFixedProgramId,
    getProgramsPageTitle,
    getProgramUpdateSuccessMessage,
    formatProgramTitle
} from "../utils/programConstants";
import ProgramForm from "../components/programs/ProgramForm";
import ProgramList from "../components/programs/ProgramList";

function ManagePrograms({ programView, onNavigate }) {
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
        setTitle(formatProgramTitle(program));
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

    useEffect(() => {
        if (programView !== "edit" && editingId) {
            resetForm();
            setError("");
            setSuccess("");
        }
    }, [programView]);

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
                setSuccess(getProgramUpdateSuccessMessage(editingId));
            } else {
                await addProgram(programData);
                setSuccess("התוכנית נוספה בהצלחה");
            }

            resetForm();
            if (programView === "edit") {
                staffNavigateBack();
            } else {
                onNavigate("programs");
            }
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
        onNavigate(buildStaffPage("programs", "edit"));
    }

    function handleCancelEdit() {
        resetForm();
        setError("");
        setSuccess("");
        if (programView === "edit") {
            staffNavigateBack();
        } else {
            onNavigate("programs");
        }
    }

    async function handleDelete(programId) {
        if (isFixedProgramId(programId)) {
            setError("לא ניתן למחוק תוכנית מערכת");
            setSuccess("");
            return;
        }

        const confirmed = window.confirm("האם למחוק תוכנית זו?");
        if (!confirmed) {
            return;
        }

        try {
            await deleteProgram(programId);
            if (editingId === programId) {
                resetForm();
                if (programView === "edit") {
                    staffNavigateBack();
                } else {
                    onNavigate("programs");
                }
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
        <div className="staff-page staff-page--programs">
            <header className="staff-header">
                <h1>ניהול תוכניות</h1>
            </header>

            <div className="staff-container">
                {editingId && (
                    <section className="staff-section">
                        <h2>{getProgramsPageTitle(editingId)}</h2>
                    </section>
                )}

                <section className="staff-section">
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
                </section>

                <section className="staff-section">
                    <ProgramList
                        programs={programs}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </section>
            </div>
        </div>
    );
}

export default ManagePrograms;
