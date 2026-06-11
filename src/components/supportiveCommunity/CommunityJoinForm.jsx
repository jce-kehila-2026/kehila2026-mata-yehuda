import { useState } from "react";
import HelpServicesSelector from "./HelpServicesSelector";
import LanguagesSelector from "./LanguagesSelector";

import "../../styles/supportive community/SupportiveCommunityPage.css";
import "../../styles/supportive community/CommunityJoinForm.css";
import { saveCommunityJoinRequest } from "../../services/staffManegmentServices/supportiveCommunityService";

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

  const updateField = (field, value) => {
    setCommunityJoinForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !communityJoinForm.participantName.trim() ||
      !communityJoinForm.participantId.trim() ||
      !communityJoinForm.phone.trim() ||
      !communityJoinForm.address.trim()
    ) {
      alert("נא למלא את כל שדות החובה");
      return;
    }

    if (!/^\d{9}$/.test(communityJoinForm.participantId)) {
      alert("מספר תעודת זהות חייב להיות מספר בן 9 ספרות");
      return;
    }

    if (!/^05\d{8}$/.test(communityJoinForm.phone)) {
      alert("מספר טלפון חייב להיות מספר תקין בן 10 ספרות");
      return;
    }

    if (communityJoinForm.services.length === 0) {
      alert("נא לבחור לפחות סוג עזרה אחד");
      return;
    }

    if (
      communityJoinForm.services.includes("other") &&
      !communityJoinForm.otherService.trim()
    ) {
      alert("נא לתאר את סוג העזרה המבוקש");
      return;
    }

    if (communityJoinForm.languages.length === 0) {
      alert("נא לבחור לפחות שפה אחת");
      return;
    }

    try {
  await saveCommunityJoinRequest(communityJoinForm);

  alert("הבקשה נשלחה לטיפול");

  setCommunityJoinForm({
    participantId: "",
    participantName: "",
    phone: "",
    address: "",
    services: [],
    otherService: "",
    languages: [],
  });
} catch (error) {
  console.error("Error saving community join request:", error);
  alert("אירעה שגיאה בשמירת הבקשה");
}
  };

  return (
    <div className="supportive-community-page">
      <section className="community-hero">
        <h1>בקשת הצטרפות לקהילה תומכת</h1>
        <p>מלאו את הפרטים ונחזור אליכם בהקדם</p>
      </section>

      <form className="community-join-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>פרטים אישיים</h2>
          <p className="form-hint">כל השדות בשלב זה הם שדות חובה</p>

          <div className="form-fields">
            <div className="form-field">
              <label htmlFor="participantName">
                שם מלא <span className="required">*</span>
              </label>
              <input
                id="participantName"
                type="text"
                autoComplete="name"
                value={communityJoinForm.participantName}
                onChange={(e) => updateField("participantName", e.target.value)}
              />
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
                value={communityJoinForm.participantId}
                onChange={(e) => updateField("participantId", e.target.value)}
              />
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
                value={communityJoinForm.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="address">
                כתובת מגורים <span className="required">*</span>
              </label>
              <input
                id="address"
                type="text"
                autoComplete="street-address"
                value={communityJoinForm.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <HelpServicesSelector
            selectedServices={communityJoinForm.services}
            setSelectedServices={(services) => updateField("services", services)}
          />

          {communityJoinForm.services.includes("other") && (
            <div className="form-field">
              <label htmlFor="otherService">
                תאר את סוג העזרה <span className="required">*</span>
              </label>
              <textarea
                id="otherService"
                value={communityJoinForm.otherService}
                onChange={(e) => updateField("otherService", e.target.value)}
              />
            </div>
          )}
        </section>

        <section className="form-section">
          <LanguagesSelector
            selectedLanguages={communityJoinForm.languages}
            setSelectedLanguages={(languages) => updateField("languages", languages)}
          />
        </section>

        <div className="form-submit">
          <button type="submit">שליחת בקשה</button>
        </div>
      </form>
    </div>
  );
}

export default CommunityJoinForm;
