import { useState } from "react";
import {
  saveVolunteerData,
  checkIfVolunteerExists,
} from "../../services/supportive community/volunteerService";

import HelpServicesSelector from "../supportiveCommunity/HelpServicesSelector";
import LanguagesSelector from "../supportiveCommunity/LanguagesSelector";

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

  const updateField = (field, value) => {
    setVolunteerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !volunteerForm.volunteerId.trim() ||
      !volunteerForm.phone.trim() ||
      !volunteerForm.firstName.trim() ||
      !volunteerForm.lastName.trim() ||
      !volunteerForm.gender ||
      !volunteerForm.birthDate ||
      !volunteerForm.address.trim() ||
      !volunteerForm.about.trim()
    ) {
      alert("נא למלא את כל שדות החובה");
      return;
    }

    if (!/^\d{9}$/.test(volunteerForm.volunteerId)) {
      alert("מספר תעודת זהות חייב להיות מספר בן 9 ספרות");
      return;
    }

    if (!/^05\d{8}$/.test(volunteerForm.phone)) {
      alert("מספר טלפון חייב להיות מספר תקין בן 10 ספרות");
      return;
    }

    if (volunteerForm.services.length === 0) {
      alert("נא לבחור לפחות סוג עזרה אחד");
      return;
    }

    if (
      volunteerForm.services.includes("other") &&
      !volunteerForm.otherService.trim()
    ) {
      alert("נא לתאר את סוג העזרה הנוסף");
      return;
    }

    if (volunteerForm.languages.length === 0) {
      alert("נא לבחור לפחות שפה אחת");
      return;
    }

    const exists = await checkIfVolunteerExists(volunteerForm.volunteerId);

    if (exists) {
      const shouldUpdate = window.confirm(
        "מתנדב עם מספר זהות זה כבר קיים במערכת. האם ברצונך לעדכן את הפרטים?"
      );

      if (!shouldUpdate) {
        return;
      }
    }

    const volunteerData = {
      volunteerId: volunteerForm.volunteerId,
      phone: volunteerForm.phone,
      firstName: volunteerForm.firstName,
      lastName: volunteerForm.lastName,
      gender: volunteerForm.gender,
      birthDate: volunteerForm.birthDate,
      address: volunteerForm.address,
      services: volunteerForm.services,
      otherService: volunteerForm.otherService,
      languages: volunteerForm.languages,
      about: volunteerForm.about,
      notes: volunteerForm.notes,
      isActive: true,
      status: "pending",
    };

    try {
      await saveVolunteerData(volunteerForm.volunteerId, volunteerData);

      alert("בקשת ההתנדבות נשמרה בהצלחה");
      resetForm();
    } catch (error) {
      console.error("Error saving volunteer:", error);
      alert("אירעה שגיאה בשמירת הנתונים");
    }
  };

  return (
   <form className="community-join-form" onSubmit={handleSubmit}>
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
        <button type="submit">שליחת בקשת התנדבות</button>
      </div>
    </form>
  );
}

export default VolunteerRegistrationForm;