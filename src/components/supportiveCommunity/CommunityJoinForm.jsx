import { useState } from "react";
import { Link } from "react-router-dom";
import HelpServicesSelector from "./HelpServicesSelector";
import LanguagesSelector from "./LanguagesSelector";

import "../../styles/supportive community/CommunityJoinPage.css";
import "../../styles/supportive community/CommunityJoinForm.css";
import { saveCommunityJoinRequest } from "../../services/supportive community/supportiveCommunityService";
import {
  INVALID_ADDRESS_MESSAGE,
  isValidAddress,
  nameContainsNumber,
} from "../../utils/nameValidation";

const VALIDATION_SUMMARY = "יש לתקן את השדות המסומנים באדום";

function validateJoinForm(form) {
  const errors = {};

  if (!form.participantName.trim()) {
    errors.participantName = "שגיאה: נא למלא את כל שדות החובה";
  } else if (nameContainsNumber(form.participantName)) {
    errors.participantName = "השם אינו יכול להכיל מספרים";
  }

  if (!form.participantId.trim()) {
    errors.participantId = "שגיאה: נא למלא את כל שדות החובה";
  } else if (!/^\d{9}$/.test(form.participantId)) {
    errors.participantId = "מספר תעודת זהות חייב להיות מספר בן 9 ספרות";
  }

  if (!form.phone.trim()) {
    errors.phone = "שגיאה: נא למלא את כל שדות החובה";
  } else if (!/^05\d{8}$/.test(form.phone)) {
    errors.phone = "מספר טלפון חייב להיות מספר תקין בן 10 ספרות";
  }

  if (!form.address.trim()) {
    errors.address = "שגיאה: נא למלא את כל שדות החובה";
  } else if (!isValidAddress(form.address)) {
    errors.address = INVALID_ADDRESS_MESSAGE;
  }

  if (form.services.length === 0) {
    errors.services = "שגיאה: נא לבחור לפחות סוג עזרה אחד";
  }

  if (form.services.includes("other") && !form.otherService.trim()) {
    errors.otherService = "שגיאה: נא לתאר את סוג העזרה המבוקש";
  }

  if (form.languages.length === 0) {
    errors.languages = "שגיאה: נא לבחור לפחות שפה אחת";
  }

  return errors;
}

function CommunityJoinForm() {
  const [communityJoinForm, setCommunityJoinForm] = useState({
    participantId: "",
    participantName: "",
    phone: "",
    address: "",
    services: [],
    otherService: "",
    languages: [],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFieldUpdate = (field, value) => {
    const nextForm = { ...communityJoinForm, [field]: value };
    setCommunityJoinForm(nextForm);

    if (Object.keys(fieldErrors).length > 0) {
      const nextErrors = validateJoinForm(nextForm);
      setFieldErrors(nextErrors);

      if (
        message.text === VALIDATION_SUMMARY &&
        Object.keys(nextErrors).length === 0
      ) {
        setMessage({ type: "", text: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateJoinForm(communityJoinForm);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage({ type: "error", text: VALIDATION_SUMMARY });
      return;
    }

    setFieldErrors({});
    setMessage({ type: "", text: "" });

    try {
      await saveCommunityJoinRequest(communityJoinForm);

      setCommunityJoinForm({
        participantId: "",
        participantName: "",
        phone: "",
        address: "",
        services: [],
        otherService: "",
        languages: [],
      });

      setMessage({
        type: "success",
        text:
          "הבקשה נשלחה בהצלחה.\n" +
          "נציג מטעם הקהילה התומכת ייצור עמכם קשר בהקדם לצורך השלמת הפרטים וההרשמה הסופית.",
      });
    } catch (error) {
      console.error("Error saving community join request:", error);
      setMessage({
        type: "error",
        text: "אירעה שגיאה בשמירת הפרטים, נסו שוב",
      });
    }
  };

  return (
    <div className="community-join-staff-page list-mgmt-page" dir="rtl">
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--top"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--bottom"
      />

      <div className="staff-container">
        <header className="list-mgmt-page__header">
          <div className="list-mgmt-page__header-main">
            <h1 className="list-mgmt-page__title">בקשת הצטרפות לקהילה תומכת</h1>
            <p className="list-mgmt-page__subtitle">
              מלאו את הפרטים ונחזור אליכם בהקדם להשלמת ההרשמה
            </p>
          </div>
          <div className="list-mgmt-page__actions">
            <Link to="/supportive-community" className="staff-back-button">
              <span className="staff-back-button__icon" aria-hidden="true">
                →
              </span>
              חזרה לקהילה תומכת
            </Link>
          </div>
        </header>

        <form
          className="community-join-staff-form community-join-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="community-join-staff-card">
            <section className="form-section">
              <div className="community-join-staff-section__head">
                <h2>פרטים אישיים</h2>
                <p className="form-hint">כל השדות בשלב זה הם שדות חובה</p>
              </div>

              <div className="form-fields">
                <div className="form-field">
              <label htmlFor="participantName">
                שם מלא <span className="required">*</span>
              </label>
              <input
                id="participantName"
                type="text"
                autoComplete="name"
                className={fieldErrors.participantName ? "field-invalid" : ""}
                aria-invalid={Boolean(fieldErrors.participantName)}
                aria-describedby={
                  fieldErrors.participantName ? "participantName-error" : undefined
                }
                value={communityJoinForm.participantName}
                onChange={(e) =>
                  handleFieldUpdate("participantName", e.target.value)
                }
              />
              {fieldErrors.participantName && (
                <span
                  id="participantName-error"
                  className="field-error"
                  role="alert"
                >
                  {fieldErrors.participantName}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="participantId">
                תעודת זהות <span className="required">*</span>
              </label>
              <input
                id="participantId"
                type="text"
                inputMode="numeric"
                maxLength={9}
                className={fieldErrors.participantId ? "field-invalid" : ""}
                aria-invalid={Boolean(fieldErrors.participantId)}
                aria-describedby={
                  fieldErrors.participantId ? "participantId-error" : undefined
                }
                value={communityJoinForm.participantId}
                onChange={(e) =>
                  handleFieldUpdate("participantId", e.target.value)
                }
              />
              {fieldErrors.participantId && (
                <span
                  id="participantId-error"
                  className="field-error"
                  role="alert"
                >
                  {fieldErrors.participantId}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone">
                מספר טלפון <span className="required">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                maxLength={10}
                placeholder="05XXXXXXXX"
                className={fieldErrors.phone ? "field-invalid" : ""}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                value={communityJoinForm.phone}
                onChange={(e) => handleFieldUpdate("phone", e.target.value)}
              />
              {fieldErrors.phone && (
                <span id="phone-error" className="field-error" role="alert">
                  {fieldErrors.phone}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="address">
                כתובת מגורים <span className="required">*</span>
              </label>
              <input
                id="address"
                type="text"
                autoComplete="street-address"
                className={fieldErrors.address ? "field-invalid" : ""}
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={
                  fieldErrors.address ? "address-error" : undefined
                }
                value={communityJoinForm.address}
                onChange={(e) => handleFieldUpdate("address", e.target.value)}
              />
              {fieldErrors.address && (
                <span id="address-error" className="field-error" role="alert">
                  {fieldErrors.address}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="form-section">
          <div
            className={
              fieldErrors.services ? "form-selector-wrapper form-selector--invalid" : "form-selector-wrapper"
            }
          >
            <HelpServicesSelector
              selectedServices={communityJoinForm.services}
              setSelectedServices={(services) =>
                handleFieldUpdate("services", services)
              }
            />
            {fieldErrors.services && (
              <span className="field-error" role="alert">
                {fieldErrors.services}
              </span>
            )}
          </div>

          {communityJoinForm.services.includes("other") && (
            <div className="form-field">
              <label htmlFor="otherService">
                תאר את סוג העזרה <span className="required">*</span>
              </label>
              <textarea
                id="otherService"
                className={fieldErrors.otherService ? "field-invalid" : ""}
                aria-invalid={Boolean(fieldErrors.otherService)}
                aria-describedby={
                  fieldErrors.otherService ? "otherService-error" : undefined
                }
                value={communityJoinForm.otherService}
                onChange={(e) =>
                  handleFieldUpdate("otherService", e.target.value)
                }
              />
              {fieldErrors.otherService && (
                <span
                  id="otherService-error"
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
              selectedLanguages={communityJoinForm.languages}
              setSelectedLanguages={(languages) =>
                handleFieldUpdate("languages", languages)
              }
            />
            {fieldErrors.languages && (
              <span className="field-error" role="alert">
                {fieldErrors.languages}
              </span>
            )}
          </div>
        </section>

            <div className="community-join-staff-submit form-submit">
              {message.text && (
                <div
                  className={`form-message form-message--${message.type}`}
                  role={message.type === "error" ? "alert" : "status"}
                >
                  {message.text}
                </div>
              )}
              <button type="submit">שליחת בקשה</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommunityJoinForm;
