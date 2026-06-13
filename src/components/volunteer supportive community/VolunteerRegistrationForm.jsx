import { useState } from "react";
import {
  saveVolunteerData,
  checkIfVolunteerExists,
} from "../../services/supportive community/volunteerService";

import HelpServicesSelector from "../supportiveCommunity/HelpServicesSelector";
import LanguagesSelector from "../supportiveCommunity/LanguagesSelector";

import "../../styles/supportive community/VolunteerRegistrationForm.css";

const DUPLICATE_MESSAGE =
  "מספר תעודת הזהות כבר קיים במערכת. האם תרצה/י לעדכן את הפרטים?";

function validateVolunteerForm(form) {
  if (
    !form.volunteerId.trim() ||
    !form.phone.trim() ||
    !form.firstName.trim() ||
    !form.lastName.trim() ||
    !form.gender ||
    !form.birthDate ||
    !form.address.trim() ||
    !form.about.trim()
  ) {
    return { submit: "נא למלא את כל שדות החובה" };
  }

  if (!/^\d{9}$/.test(form.volunteerId)) {
    return { submit: "מספר תעודת זהות חייב להיות מספר בן 9 ספרות" };
  }

  if (!/^05\d{8}$/.test(form.phone)) {
    return { submit: "מספר טלפון חייב להיות מספר תקין בן 10 ספרות" };
  }

  if (form.services.length === 0) {
    return { submit: "נא לבחור לפחות סוג עזרה אחד" };
  }

  if (form.services.includes("other") && !form.otherService.trim()) {
    return { submit: "נא לתאר את סוג העזרה הנוסף" };
  }

  if (form.languages.length === 0) {
    return { submit: "נא לבחור לפחות שפה אחת" };
  }

  return {};
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
  const [message, setMessage] = useState({ type: "", text: "" });
  const [duplicatePrompt, setDuplicatePrompt] = useState(false);

  const updateField = (field, value) => {
    setVolunteerForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (duplicatePrompt) {
      setDuplicatePrompt(false);
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
    setMessage({ type: "", text: "" });
    setDuplicatePrompt(false);

    const errors = validateVolunteerForm(volunteerForm);

    if (errors.submit) {
      setMessage({ type: "error", text: errors.submit });
      return;
    }

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
    <form className="community-join-form volunteer-registration-form" onSubmit={handleSubmit} noValidate>
      <section className="form-section">
        <h2>פרטים אישיים</h2>
        <p className="form-hint">כל השדות המסומנים ב-* הם שדות חובה</p>

        <div className="form-fields">
          <div className="form-field">
            <label>תעודת זהות *</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={9}
              value={volunteerForm.volunteerId}
              onChange={(e) => updateField("volunteerId", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>מספר טלפון *</label>
            <input
              type="text"
              inputMode="tel"
              maxLength={10}
              placeholder="05XXXXXXXX"
              value={volunteerForm.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>שם פרטי *</label>
            <input
              type="text"
              value={volunteerForm.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>שם משפחה *</label>
            <input
              type="text"
              value={volunteerForm.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>מין *</label>
            <select
              value={volunteerForm.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            >
              <option value="">בחר/י מין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div className="form-field">
            <label>תאריך לידה *</label>
            <input
              type="date"
              value={volunteerForm.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>כתובת מגורים *</label>
            <input
              type="text"
              value={volunteerForm.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="form-section">
        <HelpServicesSelector
          selectedServices={volunteerForm.services}
          setSelectedServices={(services) => updateField("services", services)}
        />

        {volunteerForm.services.includes("other") && (
          <div className="form-field">
            <label>תאר/י במה עוד אפשר לעזור *</label>
            <textarea
              value={volunteerForm.otherService}
              onChange={(e) => updateField("otherService", e.target.value)}
            />
          </div>
        )}
      </section>

      <section className="form-section">
        <LanguagesSelector
          selectedLanguages={volunteerForm.languages}
          setSelectedLanguages={(languages) =>
            updateField("languages", languages)
          }
        />
      </section>

      <section className="form-section">
        <h2>עוד קצת עליכם</h2>

        <div className="form-field">
          <label>ספר/י קצת על עצמך *</label>
          <textarea
            value={volunteerForm.about}
            onChange={(e) => updateField("about", e.target.value)}
            placeholder="לדוגמה: ניסיון קודם, תחומי עניין, למה תרצה/י להתנדב..."
          />
        </div>

        <div className="form-field">
          <label>הערות נוספות</label>
          <textarea
            value={volunteerForm.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>
      </section>

      <div className="form-submit">
        {duplicatePrompt && (
          <div className="duplicate-prompt" role="status">
            <div className="form-message form-message--prompt">{DUPLICATE_MESSAGE}</div>
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
    </form>
  );
}

export default VolunteerRegistrationForm;
