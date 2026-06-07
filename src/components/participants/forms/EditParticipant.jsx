import { useEffect, useState } from "react";
import {
    completeParticipantRegistration,
    updateParticipant
} from "../../../services/participantService";
import { fetchRegistrationByParticipantId } from "../../../services/registrationService";
import { useParticipantForm } from "../hooks/useParticipantForm";
import ParticipantProgramFields from "./ParticipantProgramFields";
import FormActionRow from "../../shared/FormActionRow";
import {
    buildEditParticipantForm,
    emptyParticipantForm,
    applyProgramSelection,
    applyActivitySelection,
    validateParticipantForm,
    resolveEditParticipantRegistration
} from "../helpers/participantFormHelpers";

const EDIT_PARTICIPANT_DEBUG_PARTICIPANT_ID = "a6SqVwA9kZHOVcc2lyam";

function isEditParticipantDebug(participantId) {
    return String(participantId || "").trim() === EDIT_PARTICIPANT_DEBUG_PARTICIPANT_ID;
}

function EditParticipant({
    participant,
    completeRegistration = false,
    onCompleted,
    onCancel
}) {
    const [form, setForm] = useState(emptyParticipantForm);
    const [linkedRegistration, setLinkedRegistration] = useState(null);
    const [registrationId, setRegistrationId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { programs, activities, loading, loadError } = useParticipantForm();

    useEffect(() => {
        let cancelled = false;

        async function loadLinkedRegistration() {
            if (!participant?.id) {
                return;
            }

            let registration = null;

            try {
                registration = await fetchRegistrationByParticipantId(
                    participant.id
                );
            } catch (err) {
                console.log(err);
            }

            const resolvedRegistration = resolveEditParticipantRegistration(
                participant,
                registration
            );

            if (cancelled) {
                return;
            }

            setLinkedRegistration(resolvedRegistration);
            setRegistrationId(
                resolvedRegistration?.id ||
                    participant.registrationId ||
                    participant.registration?.id ||
                    null
            );
        }

        loadLinkedRegistration();

        return () => {
            cancelled = true;
        };
    }, [participant?.id, participant?.registration, participant?.registrationId]);

    useEffect(() => {
        if (!participant?.id) {
            return;
        }

        const registrationForForm = resolveEditParticipantRegistration(
            participant,
            linkedRegistration
        );

        const builtForm = buildEditParticipantForm(
            participant,
            registrationForForm,
            programs,
            activities
        );

        if (isEditParticipantDebug(participant.id)) {
            console.log("[EditParticipantFinal]", {
                participantId: participant?.id,
                registration: registrationForForm,
                linkedRegistration,
                programs,
                builtForm,
                currentFormAfterSet: form
            });
        }

        setForm(builtForm);
    }, [
        participant?.id,
        participant?.registration,
        participant?.program_id,
        participant?.registrationId,
        participant?.registration_status,
        participant?.activity_id,
        linkedRegistration,
        programs,
        activities
    ]);

    useEffect(() => {
        if (!isEditParticipantDebug(participant?.id)) {
            return;
        }

        console.log("[EditParticipantFinal] form state after render", {
            participantId: participant?.id,
            registration: linkedRegistration,
            formProgramId: form.program_id,
            form
        });
    }, [participant?.id, linkedRegistration, form]);

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
                await completeParticipantRegistration(
                    participant.id,
                    form,
                    registrationId || participant.registrationId
                );
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

                <div className="row checkbox-row">
                    <label htmlFor="edit-marketing-consent">
                        אני מאשר/ת קבלת הודעות ועדכונים ב-WhatsApp
                    </label>
                    <input
                        id="edit-marketing-consent"
                        type="checkbox"
                        checked={Boolean(form.marketing_consent)}
                        onChange={(e) => updateField("marketing_consent", e.target.checked)}
                    />
                </div>

                <ParticipantProgramFields
                    idPrefix="edit"
                    form={form}
                    programs={programs}
                    activities={activities}
                    optionsLoading={loading}
                    onProgramChange={handleProgramChange}
                    onActivityChange={handleActivityChange}
                    debugParticipantId={participant.id}
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

                <FormActionRow
                    submitLabel={
                        completeRegistration ? "השלמת רישום" : "שמירת שינויים"
                    }
                    onSubmit={handleUpdateParticipant}
                    onCancel={onCancel}
                    isSubmitting={loading}
                />
            </div>
        </div>
    );
}

export default EditParticipant;
