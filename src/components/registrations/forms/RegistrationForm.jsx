import { useState } from "react";
import {
    addRegistration,
    updateRegistration
} from "../../../services/registrationService";
import { useParticipantForm } from "../../participants/hooks/useParticipantForm";
import RegistrationProgramFields from "./RegistrationProgramFields";
import FormActionRow from "../../shared/FormActionRow";
import {
    emptyRegistrationForm,
    registrationToForm,
    applyProgramSelection,
    applyActivitySelection,
    validateRegistrationForm
} from "../helpers/registrationFormHelpers";

function RegistrationForm({
    editingRegistration = null,
    onSaved,
    onCancel
}) {
    const [form, setForm] = useState(() =>
        editingRegistration
            ? registrationToForm(editingRegistration)
            : emptyRegistrationForm
    );
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

    async function handleSubmit() {
        const validationError = validateRegistrationForm(form);

        if (validationError) {
            setError(validationError);
            setSuccess("");
            return;
        }

        try {
            if (editingRegistration?.id) {
                await updateRegistration(editingRegistration.id, form);
                setSuccess("ההרשמה עודכנה בהצלחה");
            } else {
                await addRegistration(form);
                setSuccess("ההרשמה נוספה בהצלחה");
                setForm(emptyRegistrationForm);
            }

            setError("");
            onSaved?.();
        } catch (err) {
            console.log(err);
            setError("שגיאה בשמירת ההרשמה");
            setSuccess("");
        }
    }

    return (
        <div className="staff-form">
            <h2>{editingRegistration ? "עריכת הרשמה" : "הוספת הרשמה"}</h2>

            {loadError && <p style={{ color: "red" }}>{loadError}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <label htmlFor="registration-participant-id">מזהה משתתף *</label>
            <input
                id="registration-participant-id"
                type="text"
                placeholder="participant_id"
                value={form.participant_id}
                onChange={(e) => updateField("participant_id", e.target.value)}
            />

            <RegistrationProgramFields
                idPrefix="registration"
                form={form}
                programs={programs}
                activities={activities}
                optionsLoading={loading}
                onProgramChange={handleProgramChange}
                onActivityChange={handleActivityChange}
            />

            <label htmlFor="registration-payment-method">אמצעי תשלום</label>
            <input
                id="registration-payment-method"
                type="text"
                value={form.payment_method}
                onChange={(e) => updateField("payment_method", e.target.value)}
            />

            <label htmlFor="registration-payment-status">סטטוס תשלום</label>
            <input
                id="registration-payment-status"
                type="text"
                value={form.payment_status}
                onChange={(e) => updateField("payment_status", e.target.value)}
            />

            <label htmlFor="registration-status">סטטוס הרשמה</label>
            <input
                id="registration-status"
                type="text"
                value={form.registration_status}
                onChange={(e) => updateField("registration_status", e.target.value)}
            />

            <FormActionRow
                submitLabel={
                    editingRegistration ? "שמירת שינויים" : "הוספת הרשמה"
                }
                onSubmit={handleSubmit}
                onCancel={onCancel}
                isSubmitting={loading}
            />
        </div>
    );
}

export default RegistrationForm;
