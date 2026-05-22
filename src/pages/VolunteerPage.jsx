import { useEffect, useState } from "react";

import HelpTypesSelector from "../components/volunteer/HelpTypesSelector";
import AvailabilitySelector from "../components/volunteer/AvailabilitySelector";
import LanguagesSelector from "../components/volunteer/LanguagesSelector";
import "../components/volunteer/VolunteerPage.css";

import {
  getHelpTypes,
  getLanguages,
  getVolunteerData,
  saveVolunteerData,
} from "../services/volunteerService";

function VolunteerPage() {
  const volunteerId = "123456789";

  const [helpTypes, setHelpTypes] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [selectedHelpTypes, setSelectedHelpTypes] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const helpTypesData = await getHelpTypes();
      const languagesData = await getLanguages();
      const volunteerData = await getVolunteerData(volunteerId);

      setHelpTypes(helpTypesData);
      setLanguages(languagesData);

      if (volunteerData) {
        setSelectedHelpTypes(volunteerData.helpTypes || []);
        setSelectedLanguages(volunteerData.languages || []);
        setAvailability(volunteerData.availability || []);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    if (selectedHelpTypes.length === 0) {
      alert("יש לבחור לפחות סוג עזרה אחד");
      return;
    }

    if (selectedLanguages.length === 0) {
      alert("יש לבחור לפחות שפה אחת");
      return;
    }

    if (availability.length === 0) {
      alert("יש לבחור לפחות יום זמינות אחד");
      return;
    }

    const volunteerData = {
      helpTypes: selectedHelpTypes,
      languages: selectedLanguages,
      availability: availability,
      isActive: true,
    };

    await saveVolunteerData(volunteerId, volunteerData);

    alert("הנתונים נשמרו בהצלחה");
  };

  return (
    <div className="page-container">
      <h1>עמוד מתנדב</h1>

      <div className="section">
        <HelpTypesSelector
          helpTypes={helpTypes}
          selectedHelpTypes={selectedHelpTypes}
          setSelectedHelpTypes={setSelectedHelpTypes}
        />
      </div>

      <div className="section">
        <LanguagesSelector
          languages={languages}
          selectedLanguages={selectedLanguages}
          setSelectedLanguages={setSelectedLanguages}
        />
      </div>

      <div className="section">
        <AvailabilitySelector
          availability={availability}
          setAvailability={setAvailability}
        />
      </div>

      <button className="save-button" onClick={handleSave}>
        שמירת נתונים
      </button>
    </div>
  );
}

export default VolunteerPage;