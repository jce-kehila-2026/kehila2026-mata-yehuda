import { useEffect, useState } from "react";
import { X } from "lucide-react";
import FormActionRow from "../shared/FormActionRow";

const EMPTY_FORM = {
    first_name: "",
    last_name: "",
    phone: "",
    id_number: "",
    about_me: "",
    is_active: true
};

function buildInitialForm(volunteer) {
    if (!volunteer) {
        return { ...EMPTY_FORM };
    }

    return {
        first_name: volunteer.first_name || "",
        last_name: volunteer.last_name || "",
        phone: volunteer.phone || "",
        id_number: volunteer.id_number || "",
        about_me: volunteer.about_me || "",
        is_active: volunteer.is_active !== false
    };
}

export function validateVolunteerForm(form) {
    if (!form.first_name.trim()) {
        return "נא למלא שם פרטי";
    }

    if (!form.last_name.trim()) {
        return "נא למלא שם משפחה";
    }

    if (!form.phone.trim()) {
        return "נא למלא מספר טלפון";
    }

    return "";
}

function VolunteerForm({
    isOpen,
    volunteer = null,
    onClose,
    onSubmit,
    isSubmitting = false
}) {
    const [form, setForm] = useState(() => buildInitialForm(volunteer));
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setForm(buildInitialForm(volunteer));
            setError("");
        }
    }, [isOpen, volunteer]);

    if (!isOpen) {
        return null;
    }

    function handleFieldChange(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    async function handleSubmit() {
        const validationError = validateVolunteerForm(form);

        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");

        try {
            await onSubmit({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                phone: form.phone.trim(),
                id_number: form.id_number.trim(),
                about_me: form.about_me.trim(),
                is_active: form.is_active
            });
        } catch (submitError) {
            console.error(submitError);
            setError("שגיאה בשמירת המתנדב/ה. נסו שוב.");
        }
    }

    const title = volunteer ? "עריכת מתנדב/ת" : "הוספת מתנדב/ת";

    return (
        <div
            className="day-center-volunteers-modal-overlay"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="day-center-volunteers-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="day-center-volunteer-form-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="day-center-volunteers-modal__close"
                    onClick={onClose}
                    aria-label="סגירת טופס"
                >
                    <X strokeWidth={2} aria-hidden="true" />
                </button>

                <div className="day-center-volunteers-modal__body">
                    <div className="day-center-volunteers-modal__header">
                        <h2
                            id="day-center-volunteer-form-title"
                            className="day-center-volunteers-modal__title"
                        >
                            {title}
                        </h2>
                    </div>

                    <form
                    className="staff-form day-center-volunteers-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit();
                    }}
                >
                    <label htmlFor="volunteer-first-name">
                        שם פרטי <span className="day-center-volunteers-form__required">*</span>
                    </label>
                    <input
                        id="volunteer-first-name"
                        type="text"
                        value={form.first_name}
                        onChange={(event) =>
                            handleFieldChange("first_name", event.target.value)
                        }
                        autoComplete="given-name"
                    />

                    <label htmlFor="volunteer-last-name">
                        שם משפחה <span className="day-center-volunteers-form__required">*</span>
                    </label>
                    <input
                        id="volunteer-last-name"
                        type="text"
                        value={form.last_name}
                        onChange={(event) =>
                            handleFieldChange("last_name", event.target.value)
                        }
                        autoComplete="family-name"
                    />

                    <label htmlFor="volunteer-id-number">תעודת זהות</label>
                    <input
                        id="volunteer-id-number"
                        type="text"
                        inputMode="numeric"
                        value={form.id_number}
                        onChange={(event) =>
                            handleFieldChange(
                                "id_number",
                                event.target.value.replace(/\D/g, "").slice(0, 9)
                            )
                        }
                        autoComplete="off"
                    />

                    <label htmlFor="volunteer-phone">
                        מספר טלפון <span className="day-center-volunteers-form__required">*</span>
                    </label>
                    <input
                        id="volunteer-phone"
                        type="tel"
                        className="form-box__input--phone-rtl"
                        value={form.phone}
                        onChange={(event) =>
                            handleFieldChange(
                                "phone",
                                event.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                        }
                        inputMode="numeric"
                        dir="rtl"
                        autoComplete="tel"
                    />

                    <label htmlFor="volunteer-about-me">ספר/י על עצמך</label>
                    <textarea
                        id="volunteer-about-me"
                        value={form.about_me}
                        onChange={(event) =>
                            handleFieldChange("about_me", event.target.value)
                        }
                        rows={4}
                    />

                    <label className="volunteer-active-row">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(event) =>
                                handleFieldChange("is_active", event.target.checked)
                            }
                        />
                        <span>מתנדב/ת פעיל/ה</span>
                    </label>

                    {error ? (
                        <p className="staff-alert staff-alert--error">{error}</p>
                    ) : null}

                    <FormActionRow
                        submitLabel={volunteer ? "שמירת שינויים" : "הוספת מתנדב/ת"}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                    />
                </form>
                </div>
            </div>
        </div>
    );
}

export default VolunteerForm;
