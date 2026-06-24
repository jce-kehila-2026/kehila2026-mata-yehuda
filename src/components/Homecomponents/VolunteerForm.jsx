import { useState } from "react";
import {
    INVALID_ID_NUMBER_MESSAGE,
    INVALID_PHONE_MESSAGE,
    isValidIsraeliIdNumber,
    isValidIsraeliPhoneNumber,
    submitDayCenterVolunteerRequest
} from "../../services/dayCenterVolunteerRequestService";

const EMPTY_FORM = {
    first_name: "",
    last_name: "",
    id_number: "",
    phone: "",
    about_me: ""
};

function VolunteerForm({ onClose }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleFieldChange(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    async function handleSubmit() {
        if (!form.first_name.trim() || !form.last_name.trim()) {
            setMessage("נא למלא שם פרטי ושם משפחה");
            setMessageType("error");
            return;
        }

        if (!isValidIsraeliIdNumber(form.id_number)) {
            setMessage(INVALID_ID_NUMBER_MESSAGE);
            setMessageType("error");
            return;
        }

        if (!isValidIsraeliPhoneNumber(form.phone)) {
            setMessage(INVALID_PHONE_MESSAGE);
            setMessageType("error");
            return;
        }

        setIsSubmitting(true);
        setMessage("");
        setMessageType("");

        try {
            await submitDayCenterVolunteerRequest(form);
            setMessage("תודה על פנייתך להתנדבות. הצוות יחזור אליך בימים הקרובים");
            setMessageType("success");

            setTimeout(() => {
                onClose();
            }, 1600);
        } catch (error) {
            console.error(error);
            setMessage(error.message || "שגיאה בשליחת הבקשה. נסו שוב.");
            setMessageType("error");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="form-popup">
            <div className="form-box">
                <button type="button" onClick={onClose}>
                    ×
                </button>

                <h2>התנדבות במרכז יום</h2>

                {message ? (
                    <div className={`form-message ${messageType}`}>{message}</div>
                ) : null}

                <label className="form-box__field-label" htmlFor="volunteer-first-name">
                    שם פרטי <span className="form-box__required">*</span>
                </label>
                <input
                    id="volunteer-first-name"
                    type="text"
                    placeholder="שם פרטי"
                    value={form.first_name}
                    onChange={(event) =>
                        handleFieldChange("first_name", event.target.value)
                    }
                    autoComplete="given-name"
                />

                <label className="form-box__field-label" htmlFor="volunteer-last-name">
                    שם משפחה <span className="form-box__required">*</span>
                </label>
                <input
                    id="volunteer-last-name"
                    type="text"
                    placeholder="שם משפחה"
                    value={form.last_name}
                    onChange={(event) =>
                        handleFieldChange("last_name", event.target.value)
                    }
                    autoComplete="family-name"
                />

                <label className="form-box__field-label" htmlFor="volunteer-id-number">
                    תעודת זהות <span className="form-box__required">*</span>
                </label>
                <input
                    id="volunteer-id-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="תעודת זהות"
                    value={form.id_number}
                    onChange={(event) =>
                        handleFieldChange(
                            "id_number",
                            event.target.value.replace(/\D/g, "").slice(0, 9)
                        )
                    }
                    autoComplete="off"
                />

                <label className="form-box__field-label" htmlFor="volunteer-phone">
                    מספר טלפון <span className="form-box__required">*</span>
                </label>
                <input
                    id="volunteer-phone"
                    type="tel"
                    className="form-box__input--phone-rtl"
                    placeholder="מספר טלפון"
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

                <label className="form-box__field-label" htmlFor="volunteer-about-me">
                    ספר/י על עצמך
                </label>
                <textarea
                    id="volunteer-about-me"
                    className="form-box__textarea--large"
                    placeholder="ספר/י קצת על עצמך, תחומי עניין, ניסיון קודם או כל דבר שחשוב לנו לדעת"
                    value={form.about_me}
                    onChange={(event) =>
                        handleFieldChange("about_me", event.target.value)
                    }
                    rows={5}
                />

                <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "שולח..." : "שליחה"}
                </button>
            </div>
        </div>
    );
}

export default VolunteerForm;
