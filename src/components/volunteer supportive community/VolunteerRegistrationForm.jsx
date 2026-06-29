import { useState } from "react";
import {
  saveVolunteerData,
  checkIfVolunteerExists,
} from "../../services/supportive community/volunteerService";

import HelpServicesSelector from "../supportiveCommunity/HelpServicesSelector";
import LanguagesSelector from "../supportiveCommunity/LanguagesSelector";
import {
  INVALID_ADDRESS_MESSAGE,
  isValidAddress,
  nameContainsNumber,
} from "../../utils/nameValidation";

import "../../styles/supportive community/VolunteerRegistrationForm.css";

const DUPLICATE_MESSAGE =
  "מספר תעודת הזהות כבר קיים במערכת. האם תרצה/י לעדכן את הפרטים?";

const VALIDATION_SUMMARY = "יש לתקן את השדות המסומנים באדום";

function validateVolunteerForm(form) {
  const errors = {};

  if (!form.volunteerId.trim()) {
    errors.volunteerId = "שגיאה: נא למלא את כל שדות החובה";
  } else if (!/^\d{9}$/.test(form.volunteerId)) {
    errors.volunteerId = "מספר תעודת זהות חייב להיות מספר בן 9 ספרות";
  }

  if (!form.phone.trim()) {
    errors.phone = "שגיאה: נא למלא את כל שדות החובה";
  } else if (!/^0\d{8,9}$/.test(form.phone)) {
    errors.phone = "מספר הטלפון חייב להתחיל ב-0 ולהכיל 9 או 10 ספרות";
  }

  if (!form.firstName.trim()) {
    errors.firstName = "שגיאה: נא למלא את כל שדות החובה";
  } else if (nameContainsNumber(form.firstName)) {
    errors.firstName = "השם אינו יכול להכיל מספרים";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "שגיאה: נא למלא את כל שדות החובה";
  } else if (nameContainsNumber(form.lastName)) {
    errors.lastName = "השם אינו יכול להכיל מספרים";
  }

  if (!form.gender) {
    errors.gender = "שגיאה: נא למלא את כל שדות החובה";
  }

  if (!form.birthDate) {
    errors.birthDate = "שגיאה: נא למלא את כל שדות החובה";
  }

  if (!form.address.trim()) {
    errors.address = "שגיאה: נא למלא את כל שדות החובה";
  } else if (!isValidAddress(form.address)) {
    errors.address = INVALID_ADDRESS_MESSAGE;
  }

  if (form.services.length === 0) {
    errors.services = "נא לבחור לפחות סוג עזרה אחד";
  }

  if (form.services.includes("other") && !form.otherService.trim()) {
    errors.otherService = "נא לתאר את סוג העזרה הנוסף";
  }

  if (form.languages.length === 0) {
    errors.languages = "נא לבחור לפחות שפה אחת";
  }

  if (!form.about.trim()) {
    errors.about = "שגיאה: נא למלא את כל שדות החובה";
  }

  return errors;
}

function buildVolunteerData(form) {
  return {
    volunteerId: form.volunteerId,
    phone: form.phone,
    first_name: form.firstName,
    last_name: form.lastName,
    gender: form.gender,
    birthDate: form.birthDate,
    address: form.address,
    help_types: form.services,
    otherService: form.otherService,
    languages: form.languages,
    about: form.about,
    notes: form.notes,
    is_active: false,
    status: "pending",
  };
}

function VolunteerRegistrationForm() {
  const [volunteerForm, setVolunteerForm] = useState({
    volunteerId: "",
    phone: "",
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    services: [],
    otherService: "",
    languages: [],
    about: "",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [duplicatePrompt, setDuplicatePrompt] = useState(false);

  const updateField = (field, value) => {
    const nextForm = { ...volunteerForm, [field]: value };
    setVolunteerForm(nextForm);

    if (duplicatePrompt) {
      setDuplicatePrompt(false);
    }

    if (Object.keys(fieldErrors).length > 0) {
      const nextErrors = validateVolunteerForm(nextForm);
      setFieldErrors(nextErrors);

      if (
        message.text === VALIDATION_SUMMARY &&
        Object.keys(nextErrors).length === 0
      ) {
        setMessage({ type: "", text: "" });
      }
    }
  };

  const resetForm = () => {
    setVolunteerForm({
      volunteerId: "",
      phone: "",
      firstName: "",
      lastName: "",
      gender: "",
      birthDate: "",
      address: "",
      services: [],
      otherService: "",
      languages: [],
      about: "",
      notes: "",
    });
  };

  const saveNewVolunteer = async (volunteerData) => {
    await saveVolunteerData(volunteerForm.volunteerId, volunteerData);
    resetForm();
    setMessage({
      type: "success",
      text: "בקשת ההתנדבות נשמרה בהצלחה",
    });
  };

  const handleUpdateDuplicate = async () => {
    const volunteerData = buildVolunteerData(volunteerForm);

    try {
      await saveVolunteerData(volunteerForm.volunteerId, volunteerData, {
        merge: true,
      });

      setDuplicatePrompt(false);
      setMessage({
        type: "success",
        text: "הפרטים עודכנו בהצלחה.",
      });
    } catch (error) {
      console.error("Error updating volunteer:", error);
      setMessage({
        type: "error",
        text: "אירעה שגיאה בשמירת הנתונים",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDuplicatePrompt(false);

    const errors = validateVolunteerForm(volunteerForm);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage({ type: "error", text: VALIDATION_SUMMARY });
      return;
    }

    setFieldErrors({});
    setMessage({ type: "", text: "" });

    const volunteerData = buildVolunteerData(volunteerForm);

    try {
      const exists = await checkIfVolunteerExists(volunteerForm.volunteerId);

      if (exists) {
        setDuplicatePrompt(true);
        return;
      }

      await saveNewVolunteer(volunteerData);
    } catch (error) {
      console.error("Error saving volunteer:", error);
      setMessage({
        type: "error",
        text: "אירעה שגיאה בשמירת הנתונים",
      });
    }
  };

  return (
    <form
      className="community-join-staff-form community-join-form volunteer-registration-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="community-join-staff-card">
        <section className="form-section">
          <div className="community-join-staff-section__head">
            <h2>פרטים אישיים</h2>
            <p className="form-hint">כל השדות המסומנים ב-* הם שדות חובה</p>
          </div>

          <div className="form-fields">
          <div className="form-field">
            <label htmlFor="volunteer-id">
              תעודת זהות <span className="required">*</span>
            </label>
            <input
              id="volunteer-id"
              type="text"
              inputMode="numeric"
              maxLength={9}
              className={fieldErrors.volunteerId ? "field-invalid" : ""}
              aria-invalid={Boolean(fieldErrors.volunteerId)}
              aria-describedby={
                fieldErrors.volunteerId ? "volunteer-id-error" : undefined
              }
              value={volunteerForm.volunteerId}
              onChange={(e) => updateField("volunteerId", e.target.value)}
            />
            {fieldErrors.volunteerId && (
              <span id="volunteer-id-error" className="field-error" role="alert">
                {fieldErrors.volunteerId}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="volunteer-phone">
              מספר טלפון <span className="required">*</span>
            </label>
            <input
              id="volunteer-phone"
              type="text"
              inputMode="tel"
              maxLength={10}
              placeholder="05XXXXXXXX"
              className={fieldErrors.phone ? "field-invalid" : ""}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={
                fieldErrors.phone ? "volunteer-phone-error" : undefined
              }
              value={volunteerForm.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
            {fieldErrors.phone && (
              <span
                id="volunteer-phone-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.phone}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="volunteer-first-name">
              שם פרטי <span className="required">*</span>
            </label>
            <input
              id="volunteer-first-name"
              type="text"
              className={fieldErrors.firstName ? "field-invalid" : ""}
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={
                fieldErrors.firstName ? "volunteer-first-name-error" : undefined
              }
              value={volunteerForm.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
            {fieldErrors.firstName && (
              <span
                id="volunteer-first-name-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.firstName}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="volunteer-last-name">
              שם משפחה <span className="required">*</span>
            </label>
            <input
              id="volunteer-last-name"
              type="text"
              className={fieldErrors.lastName ? "field-invalid" : ""}
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={
                fieldErrors.lastName ? "volunteer-last-name-error" : undefined
              }
              value={volunteerForm.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
            {fieldErrors.lastName && (
              <span
                id="volunteer-last-name-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.lastName}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="volunteer-gender">
              מין <span className="required">*</span>
            </label>
            <select
              id="volunteer-gender"
              className={fieldErrors.gender ? "field-invalid" : ""}
              aria-invalid={Boolean(fieldErrors.gender)}
              aria-describedby={
                fieldErrors.gender ? "volunteer-gender-error" : undefined
              }
              value={volunteerForm.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">בחר/י מין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
              <option value="other">אחר</option>
            </select>
            {fieldErrors.gender && (
              <span
                id="volunteer-gender-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.gender}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="volunteer-birth-date">
              תאריך לידה <span className="required">*</span>
            </label>
            <input
              id="volunteer-birth-date"
              type="date"
              className={fieldErrors.birthDate ? "field-invalid" : ""}
              aria-invalid={Boolean(fieldErrors.birthDate)}
              aria-describedby={
                fieldErrors.birthDate ? "volunteer-birth-date-error" : undefined
              }
              value={volunteerForm.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
            />
            {fieldErrors.birthDate && (
              <span
                id="volunteer-birth-date-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.birthDate}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="volunteer-address">
              כתובת מגורים <span className="required">*</span>
            </label>
            <input
              id="volunteer-address"
              type="text"
              autoComplete="street-address"
              className={fieldErrors.address ? "field-invalid" : ""}
              aria-invalid={Boolean(fieldErrors.address)}
              aria-describedby={
                fieldErrors.address ? "volunteer-address-error" : undefined
              }
              value={volunteerForm.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
            {fieldErrors.address && (
              <span
                id="volunteer-address-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.address}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <div
          className={
            fieldErrors.services
              ? "form-selector-wrapper form-selector--invalid"
              : "form-selector-wrapper"
          }
        >
          <HelpServicesSelector
            selectedServices={volunteerForm.services}
            setSelectedServices={(services) => updateField("services", services)}
          />
          {fieldErrors.services && (
            <span className="field-error" role="alert">
              {fieldErrors.services}
            </span>
          )}
        </div>

        {volunteerForm.services.includes("other") && (
          <div className="form-field">
            <label htmlFor="volunteer-other-service">
              תאר/י במה עוד אפשר לעזור <span className="required">*</span>
            </label>
            <textarea
              id="volunteer-other-service"
              className={fieldErrors.otherService ? "field-invalid" : ""}
              aria-invalid={Boolean(fieldErrors.otherService)}
              aria-describedby={
                fieldErrors.otherService
                  ? "volunteer-other-service-error"
                  : undefined
              }
              value={volunteerForm.otherService}
              onChange={(e) => updateField("otherService", e.target.value)}
            />
            {fieldErrors.otherService && (
              <span
                id="volunteer-other-service-error"
                className="field-error"
                role="alert"
              >
                {fieldErrors.otherService}
              </span>
            )}
          </div>
        )}
      </section>

      <section className="form-section">
        <div
          className={
            fieldErrors.languages
              ? "form-selector-wrapper form-selector--invalid"
              : "form-selector-wrapper"
          }
        >
          <LanguagesSelector
            selectedLanguages={volunteerForm.languages}
            setSelectedLanguages={(languages) =>
              updateField("languages", languages)
            }
          />
          {fieldErrors.languages && (
            <span className="field-error" role="alert">
              {fieldErrors.languages}
            </span>
          )}
        </div>
      </section>

      <section className="form-section">
        <div className="community-join-staff-section__head">
          <h2>עוד קצת עליכם</h2>
        </div>

        <div className="form-field">
          <label htmlFor="volunteer-about">
            ספר/י קצת על עצמך <span className="required">*</span>
          </label>
          <textarea
            id="volunteer-about"
            className={fieldErrors.about ? "field-invalid" : ""}
            aria-invalid={Boolean(fieldErrors.about)}
            aria-describedby={
              fieldErrors.about ? "volunteer-about-error" : undefined
            }
            value={volunteerForm.about}
            onChange={(e) => updateField("about", e.target.value)}
            placeholder="לדוגמה: ניסיון קודם, תחומי עניין, למה תרצה/י להתנדב..."
          />
          {fieldErrors.about && (
            <span id="volunteer-about-error" className="field-error" role="alert">
              {fieldErrors.about}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="volunteer-notes">הערות נוספות</label>
          <textarea
            id="volunteer-notes"
            value={volunteerForm.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>
      </section>

        <div className="community-join-staff-submit form-submit">
          {duplicatePrompt && (
            <div className="duplicate-prompt" role="status">
              <div className="form-message form-message--prompt">
                {DUPLICATE_MESSAGE}
              </div>
              <div className="duplicate-prompt-actions">
                <button type="button" onClick={handleUpdateDuplicate}>
                  עדכון פרטים
                </button>
              </div>
            </div>
          )}

          {message.text && (
            <div
              className={`form-message form-message--${message.type}`}
              role={message.type === "error" ? "alert" : "status"}
            >
              {message.text}
            </div>
          )}

          {!duplicatePrompt && (
            <button type="submit">שליחת בקשת התנדבות</button>
          )}
        </div>
      </div>
    </form>
  );
}

export default VolunteerRegistrationForm;
