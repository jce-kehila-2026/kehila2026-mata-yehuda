function LanguagesSelector({
  languages,
  selectedLanguages,
  setSelectedLanguages,
}) {

  const handleChange = (languageId) => {

    if (selectedLanguages.includes(languageId)) {

      setSelectedLanguages(
        selectedLanguages.filter(
          (id) => id !== languageId
        )
      );

    } else {

      setSelectedLanguages([
        ...selectedLanguages,
        languageId,
      ]);

    }
  };

  return (
    <div>
      <h3>בחר שפות</h3>

      <div className="options-container">

        {languages.map((language) => (

          <label
            key={language.id}
            className="option-label"
          >

            <input
              type="checkbox"
              checked={selectedLanguages.includes(
                language.id
              )}
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