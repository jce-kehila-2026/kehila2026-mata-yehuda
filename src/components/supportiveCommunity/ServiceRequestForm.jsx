import { useState } from "react";
import HelpServicesSelector from "./HelpServicesSelector";
import LanguagesSelector from "./LanguagesSelector";
import { saveHomeHelpRequest } from "../../services/supportive community/supportiveCommunityService";

function validateServiceRequest(form) {
  if (form.services.length === 0) {
    return "נא לבחור לפחות סוג עזרה אחד";
  }

  if (form.services.includes("other") && !form.otherService.trim()) {
    return "נא לתאר את סוג העזרה המבוקש";
  }

  if (form.languages.length === 0) {
    return "נא לבחור לפחות שפה אחת";
  }

  return "";
}

function ServiceRequestForm({ participantDocId, subscriptionDocId }) {
  const [serviceRequest, setServiceRequest] = useState({
    services: [],
    otherService: "",
    languages: [],
    notes: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const updateField = (field, value) => {
    setServiceRequest((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const validationError = validateServiceRequest(serviceRequest);

    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    try {
      const descriptionParts = [];

      if (
        serviceRequest.services.includes("other") &&
        serviceRequest.otherService.trim()
      ) {
        descriptionParts.push(serviceRequest.otherService.trim());
      }

      if (serviceRequest.notes.trim()) {
        descriptionParts.push(serviceRequest.notes.trim());
      }

      await saveHomeHelpRequest({
        participantDocId,
        subscriptionDocId,
        services: serviceRequest.services,
        languages: serviceRequest.languages,
        description: descriptionParts.join("\n"),
      });

      setServiceRequest({
        services: [],
        otherService: "",
        languages: [],
        notes: "",
      });

      setMessage({
        type: "success",
        text: "בקשת השירות נשלחה לטיפול",
      });
    } catch (error) {
      console.error("Error saving service request:", error);
      setMessage({
        type: "error",
        text: "אירעה שגיאה בשמירת הבקשה",
      });
    }
  };

  return (
    <form
      className="community-join-staff-form community-join-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="community-join-staff-card">
        <section className="form-section">
          <p className="form-hint">
            בחרו את סוג העזרה הדרושה. צוות העמותה יבדוק את הבקשה ויתאם מתנדב
            מתאים.
          </p>

          <HelpServicesSelector
            selectedServices={serviceRequest.services}
            setSelectedServices={(services) => updateField("services", services)}
          />

          {serviceRequest.services.includes("other") && (
            <div className="form-field">
              <label>תאר את סוג העזרה</label>
              <textarea
                value={serviceRequest.otherService}
                onChange={(e) => updateField("otherService", e.target.value)}
              />
            </div>
          )}
        </section>

        <section className="form-section">
          <LanguagesSelector
            selectedLanguages={serviceRequest.languages}
            setSelectedLanguages={(languages) =>
              updateField("languages", languages)
            }
          />
        </section>

        <section className="form-section">
          <div className="form-field">
            <label>הערות נוספות</label>
            <textarea
              value={serviceRequest.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
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
  );
}

export default ServiceRequestForm;
