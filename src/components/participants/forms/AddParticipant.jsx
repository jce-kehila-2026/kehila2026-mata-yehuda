import { useState } from "react";
import {
    addParticipant,
    PARTICIPANT_CREATED_REGISTRATION_FAILED,
    PARTICIPANT_VALIDATION_FAILED
} from "../../../services/participantService";
import { useParticipantForm } from "../hooks/useParticipantForm";
import ParticipantProgramFields from "./ParticipantProgramFields";
import {
    emptyParticipantForm,
    applyProgramSelection,
    applyActivitySelection,
    validateParticipantForm
} from "../helpers/participantFormHelpers";

function AddParticipant({ onSuccess, onCancel }) {
    const [form, setForm] = useState(emptyParticipantForm);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { programs, activities, loading, loadError } = useParticipantForm();

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

    async function handleAddParticipant() {
        const validationError = validateParticipantForm(form, programs);

        if (validationError) {
            setError(validationError);
            setSuccess("");
            return;
        }

        try {
            await addParticipant(form, programs);
            setSuccess("המשתתף נוסף בהצלחה");
            setError("");
            setForm(emptyParticipantForm);

            if (typeof onSuccess === "function") {
                onSuccess();
            }
        } catch (err) {
            console.log(err);

            if (err.message === PARTICIPANT_VALIDATION_FAILED) {
                setError(err.validationMessage || "יש לבחור פעילות");
            } else if (err.message === PARTICIPANT_CREATED_REGISTRATION_FAILED) {
                setError(
                    "המשתתף נוסף, אך יצירת ההרשמה נכשלה. אנא עדכן את ההרשמה ידנית."
                );
            } else {
                setError("שגיאה בהוספת משתתף");
            }

            setSuccess("");
        }
    }

    return (
        <div>
            <h2>הוספת משתתף</h2>

            <div className="staff-form">
                {loadError && <p style={{ color: "red" }}>{loadError}</p>}
                {error && <p className="staff-alert staff-alert--error">{error}</p>}
                {success && !onSuccess && (
                    <p className="staff-alert staff-alert--success">{success}</p>
                )}

                <label htmlFor="add-first-name">שם פרטי</label>
                <input
                    id="add-first-name"
                    type="text"
                    placeholder="שם פרטי"
                    value={form.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                />

                <label htmlFor="add-last-name">שם משפחה</label>
                <input
                    id="add-last-name"
                    type="text"
                    placeholder="שם משפחה"
                    value={form.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                />

                <label htmlFor="add-id-number">תעודת זהות *</label>
                <input
                    id="add-id-number"
                    type="text"
                    placeholder="תעודת זהות"
                    value={form.id_number}
                    onChange={(e) => updateField("id_number", e.target.value)}
                />

                <label htmlFor="add-birth-date">תאריך לידה</label>
                <input
                    id="add-birth-date"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => updateField("birth_date", e.target.value)}
                />

                <label htmlFor="add-gender">מגדר</label>
                <select
                    id="add-gender"
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                >
                    <option value="">בחר מגדר</option>
                    <option value="male">זכר</option>
                    <option value="female">נקבה</option>
                    <option value="other">אחר</option>
                </select>

                <label htmlFor="add-phone">טלפון *</label>
                <input
                    id="add-phone"
                    type="text"
                    placeholder="טלפון"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                />

                <div className="row checkbox-row">
                    <label htmlFor="add-marketing-consent">
                        אני מאשר/ת קבלת הודעות ועדכונים ב-WhatsApp
                    </label>
                    <input
                        id="add-marketing-consent"
                        type="checkbox"
                        checked={Boolean(form.marketing_consent)}
                        onChange={(e) => updateField("marketing_consent", e.target.checked)}
                    />
                </div>

                <ParticipantProgramFields
                    idPrefix="add"
                    form={form}
                    programs={programs}
                    activities={activities}
                    optionsLoading={loading}
                    onProgramChange={handleProgramChange}
                    onActivityChange={handleActivityChange}
                />

                <label htmlFor="add-address">כתובת</label>
                <input
                    id="add-address"
                    type="text"
                    placeholder="כתובת"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                />

                <label htmlFor="add-emergency">מספר חירום</label>
                <input
                    id="add-emergency"
                    type="text"
                    placeholder="מספר חירום"
                    value={form.emergency_number}
                    onChange={(e) => updateField("emergency_number", e.target.value)}
                />

                <label htmlFor="add-medical">הערות רפואיות</label>
                <textarea
                    id="add-medical"
                    placeholder="הערות רפואיות"
                    value={form.medical_notes}
                    onChange={(e) => updateField("medical_notes", e.target.value)}
                />

                <label htmlFor="add-mobility">מגבלות ניידות</label>
                <textarea
                    id="add-mobility"
                    placeholder="מגבלות ניידות"
                    value={form.mobility_limitations}
                    onChange={(e) => updateField("mobility_limitations", e.target.value)}
                />

                <button
                    type="button"
                    className="staff-button"
                    onClick={handleAddParticipant}
                    disabled={loading}
                >
                    הוספת משתתף
                </button>

                {onCancel ? (
                    <button
                        type="button"
                        className="staff-button staff-button--secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        ביטול
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default AddParticipant;
