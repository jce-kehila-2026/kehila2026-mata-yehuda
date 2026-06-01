import { useState } from "react";
import {
    completeParticipantRegistration,
    updateParticipant
} from "../../../services/participantService";
import { formatDate } from "../../../utils/dateUtils";
import { useParticipantForm } from "../hooks/useParticipantForm";
import ParticipantProgramFields from "./ParticipantProgramFields";
import {
    participantToForm,
    applyProgramSelection,
    applyActivitySelection,
    validateParticipantForm
} from "../helpers/participantFormHelpers";

function EditParticipant({
    participant,
    completeRegistration = false,
    onCompleted,
    onCancel
}) {
    const [form, setForm] = useState(() => ({
        ...participantToForm(participant),
        birth_date: formatDate(participant?.birth_date) || ""
    }));
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { programs, activities, loading, loadError } = useParticipantForm();

    if (!participant) {
        return <p>לא נבחר משתתף לעריכה</p>;
    }

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleProgramChange(programId) {
        setForm((prev) => ({
            ...prev,
            ...applyProgramSelection(programId, programs)
        }));
    }

    function handleActivityChange(activityId) {
        setForm((prev) => ({
            ...prev,
            ...applyActivitySelection(activityId, activities)
        }));
    }

    async function handleUpdateParticipant() {
        const validationError = validateParticipantForm(form, programs);

        if (validationError) {
            setError(validationError);
            setSuccess("");
            return;
        }

        try {
            if (completeRegistration) {
                await completeParticipantRegistration(participant.id, form);
                setSuccess("הרישום הושלם בהצלחה");
            } else {
                await updateParticipant(participant.id, form);
                setSuccess("המשתתף עודכן בהצלחה");
            }
            setError("");
            onCompleted?.();
        } catch (err) {
            console.log(err);
            setError("שגיאה בעדכון המשתתף");
            setSuccess("");
        }
    }

    return (
        <div>
            <h2>{completeRegistration ? "השלמת רישום משתתף" : "עריכת משתתף"}</h2>

            <div className="staff-form">
                {loadError && <p style={{ color: "red" }}>{loadError}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <label htmlFor="edit-first-name">שם פרטי</label>
                <input
                    id="edit-first-name"
                    type="text"
                    placeholder="שם פרטי"
                    value={form.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                />

                <label htmlFor="edit-last-name">שם משפחה</label>
                <input
                    id="edit-last-name"
                    type="text"
                    placeholder="שם משפחה"
                    value={form.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                />

                <label htmlFor="edit-id-number">תעודת זהות *</label>
                <input
                    id="edit-id-number"
                    type="text"
                    placeholder="תעודת זהות"
                    value={form.id_number}
                    onChange={(e) => updateField("id_number", e.target.value)}
                />

                <label htmlFor="edit-birth-date">תאריך לידה</label>
                <input
                    id="edit-birth-date"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => updateField("birth_date", e.target.value)}
                />

                <label htmlFor="edit-gender">מגדר</label>
                <select
                    id="edit-gender"
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                >
                    <option value="">בחר מגדר</option>
                    <option value="male">זכר</option>
                    <option value="female">נקבה</option>
                    <option value="other">אחר</option>
                </select>

                <label htmlFor="edit-phone">טלפון *</label>
                <input
                    id="edit-phone"
                    type="text"
                    placeholder="טלפון"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                />

                <ParticipantProgramFields
                    idPrefix="edit"
                    form={form}
                    programs={programs}
                    activities={activities}
                    optionsLoading={loading}
                    onProgramChange={handleProgramChange}
                    onActivityChange={handleActivityChange}
                />

                <label htmlFor="edit-address">כתובת</label>
                <input
                    id="edit-address"
                    type="text"
                    placeholder="כתובת"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                />

                <label htmlFor="edit-emergency">מספר חירום</label>
                <input
                    id="edit-emergency"
                    type="text"
                    placeholder="מספר חירום"
                    value={form.emergency_number}
                    onChange={(e) => updateField("emergency_number", e.target.value)}
                />

                <label htmlFor="edit-medical">הערות רפואיות</label>
                <textarea
                    id="edit-medical"
                    placeholder="הערות רפואיות"
                    value={form.medical_notes}
                    onChange={(e) => updateField("medical_notes", e.target.value)}
                />

                <label htmlFor="edit-mobility">מגבלות ניידות</label>
                <textarea
                    id="edit-mobility"
                    placeholder="מגבלות ניידות"
                    value={form.mobility_limitations}
                    onChange={(e) => updateField("mobility_limitations", e.target.value)}
                />

                {onCancel && (
                    <button type="button" onClick={onCancel}>
                        חזרה לרשימת בקשות
                    </button>
                )}

                <button type="button" onClick={handleUpdateParticipant} disabled={loading}>
                    {completeRegistration ? "השלמת רישום" : "שמירת שינויים"}
                </button>
            </div>
        </div>
    );
}

export default EditParticipant;
