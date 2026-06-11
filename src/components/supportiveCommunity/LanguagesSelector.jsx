import { useEffect, useState } from "react";
import { getActiveLanguages } from "../../services/supportiveCommunityService";

function LanguagesSelector({
  selectedLanguages = [],
  setSelectedLanguages,
}) {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const data = await getActiveLanguages();
        setLanguages(data);
      } catch (error) {
        console.error("Error loading languages:", error);
      }
    };

    loadLanguages();
  }, []);

  const handleChange = (languageId) => {
    if (selectedLanguages.includes(languageId)) {
      setSelectedLanguages(
        selectedLanguages.filter((id) => id !== languageId)
      );
    } else {
      setSelectedLanguages([
        ...selectedLanguages,
        languageId,
      ]);
    }
  };

  return (
    <div className="form-selector">
      <h3>בחר שפות</h3>

      <div className="options-container">
        {languages.map((language) => (
          <label
            key={language.id}
            className="option-label"
          >
            <input
              type="checkbox"
              checked={selectedLanguages.includes(language.id)}
              onChange={() =>
                handleChange(language.id)
              }
            />

            {language.name}
          </label>
        ))}
      </div>
    </div>
  );
}

export default LanguagesSelector;