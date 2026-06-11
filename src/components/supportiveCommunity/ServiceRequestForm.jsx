import { useState } from "react";
import HelpServicesSelector from "./HelpServicesSelector";
import { saveHomeHelpRequest } from "../../services/supportive community/supportiveCommunityService";

function ServiceRequestForm({ participantDocId }) {
  const [serviceRequest, setServiceRequest] = useState({
    services: [],
    otherService: "",
    notes: "",
  });

  const updateField = (field, value) => {
    setServiceRequest((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (serviceRequest.services.length === 0) {
      alert("נא לבחור לפחות סוג עזרה אחד");
      return;
    }

    if (
      serviceRequest.services.includes("other") &&
      !serviceRequest.otherService.trim()
    ) {
      alert("נא לתאר את סוג העזרה המבוקש");
      return;
    }

    try {
      await saveHomeHelpRequest({
        participantDocId,
        ...serviceRequest,
      });

      alert("בקשת השירות נשלחה לטיפול");

      setServiceRequest({
        services: [],
        otherService: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving service request:", error);
      alert("אירעה שגיאה בשמירת הבקשה");
    }
  };

  return (
    <form className="community-join-form" onSubmit={handleSubmit}>
      <section className="form-section">
        <h2>בקשת שירות נוסף</h2>
        <p className="form-hint">
          בחרו את סוג העזרה הדרושה. צוות העמותה יבדוק את הבקשה ויתאם מתנדב מתאים.
        </p>

        <HelpServicesSelector
          selectedServices={serviceRequest.services}
          setSelectedServices={(services) =>
            updateField("services", services)
          }
        />

        {serviceRequest.services.includes("other") && (
          <div className="form-field">
            <label>תאר את סוג העזרה</label>
            <textarea
              value={serviceRequest.otherService}
              onChange={(e) =>
                updateField("otherService", e.target.value)
              }
            />
          </div>
        )}

        <div className="form-field">
          <label>הערות נוספות</label>
          <textarea
            value={serviceRequest.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>

        <div className="form-submit">
          <button type="submit">שליחת בקשה</button>
        </div>
      </section>
    </form>
  );
}

export default ServiceRequestForm;
