import { useEffect, useState } from "react";
import { X } from "lucide-react";
import FormActionRow from "../shared/FormActionRow";
import {
    PAYMENT_METHOD_OPTIONS,
    timestampToDate
} from "../../services/donationService";

const EMPTY_FORM = {
    donor_name: "",
    phone: "",
    amount: "",
    payment_method: "cash",
    donation_date: "",
    notes: ""
};

function formatDateForInput(value) {
    const date = timestampToDate(value);

    if (!date) {
        return new Date().toISOString().slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
}

function buildInitialForm(donation) {
    if (!donation) {
        return {
            ...EMPTY_FORM,
            donation_date: new Date().toISOString().slice(0, 10)
        };
    }

    return {
        donor_name: donation.donor_name || "",
        phone: donation.phone || "",
        amount: donation.amount != null ? String(donation.amount) : "",
        payment_method: donation.payment_method || "cash",
        donation_date: formatDateForInput(donation.donation_date),
        notes: donation.notes || ""
    };
}

function validateForm(form) {
    if (!form.donor_name.trim()) {
        return "נא למלא שם תורם";
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return "נא להזין סכום תרומה חיובי";
    }

    if (!form.donation_date) {
        return "נא לבחור תאריך תרומה";
    }

    return "";
}

function DonationForm({
    isOpen,
    donation = null,
    onClose,
    onSubmit,
    isSubmitting = false
}) {
    const [form, setForm] = useState(() => buildInitialForm(donation));
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setForm(buildInitialForm(donation));
            setError("");
        }
    }, [isOpen, donation]);

    if (!isOpen) {
        return null;
    }

    function handleFieldChange(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    async function handleSubmit() {
        const validationError = validateForm(form);

        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");

        try {
            await onSubmit({
                donor_name: form.donor_name.trim(),
                phone: form.phone.trim(),
                amount: Number(form.amount),
                payment_method: form.payment_method,
                donation_date: new Date(`${form.donation_date}T12:00:00`),
                notes: form.notes.trim()
            });
        } catch (submitError) {
            console.error(submitError);
            setError("שגיאה בשמירת התרומה. נסו שוב.");
        }
    }

    const title = donation ? "עריכת תרומה" : "הוספת תרומה";

    return (
        <div
            className="donations-modal-overlay"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="donations-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="donation-form-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="donations-modal__header">
                    <h2 id="donation-form-title" className="donations-modal__title">
                        {title}
                    </h2>
                    <button
                        type="button"
                        className="donations-modal__close"
                        onClick={onClose}
                        aria-label="סגירת טופס"
                    >
                        <X strokeWidth={2} aria-hidden="true" />
                    </button>
                </div>

                <form
                    className="staff-form donations-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit();
                    }}
                >
                    <label htmlFor="donation-donor-name">
                        שם התורם <span className="donations-form__required">*</span>
                    </label>
                    <input
                        id="donation-donor-name"
                        type="text"
                        value={form.donor_name}
                        onChange={(event) =>
                            handleFieldChange("donor_name", event.target.value)
                        }
                        autoComplete="name"
                    />

                    <label htmlFor="donation-phone">טלפון</label>
                    <input
                        id="donation-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                            handleFieldChange("phone", event.target.value)
                        }
                        autoComplete="tel"
                    />

                    <label htmlFor="donation-amount">
                        סכום תרומה (₪) <span className="donations-form__required">*</span>
                    </label>
                    <input
                        id="donation-amount"
                        type="number"
                        min="1"
                        step="1"
                        value={form.amount}
                        onChange={(event) =>
                            handleFieldChange("amount", event.target.value)
                        }
                    />

                    <label htmlFor="donation-payment-method">אמצעי תשלום</label>
                    <select
                        id="donation-payment-method"
                        value={form.payment_method}
                        onChange={(event) =>
                            handleFieldChange("payment_method", event.target.value)
                        }
                    >
                        {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="donation-date">תאריך תרומה</label>
                    <input
                        id="donation-date"
                        type="date"
                        value={form.donation_date}
                        onChange={(event) =>
                            handleFieldChange("donation_date", event.target.value)
                        }
                    />

                    <label htmlFor="donation-notes">הערות</label>
                    <textarea
                        id="donation-notes"
                        value={form.notes}
                        onChange={(event) =>
                            handleFieldChange("notes", event.target.value)
                        }
                        rows={3}
                    />

                    {error ? (
                        <p className="staff-alert staff-alert--error">{error}</p>
                    ) : null}

                    <FormActionRow
                        submitLabel={donation ? "שמירת שינויים" : "הוספת תרומה"}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                    />
                </form>
            </div>
        </div>
    );
}

export default DonationForm;
