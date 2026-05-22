function HelpTypesSelector({
  helpTypes,
  selectedHelpTypes,
  setSelectedHelpTypes,
}) {

  const handleChange = (helpTypeId) => {

    if (selectedHelpTypes.includes(helpTypeId)) {

      setSelectedHelpTypes(
        selectedHelpTypes.filter(
          (id) => id !== helpTypeId
        )
      );

    } else {

      setSelectedHelpTypes([
        ...selectedHelpTypes,
        helpTypeId,
      ]);

    }
  };

  return (
    <div>
      <h3>בחר סוגי עזרה</h3>

      <div className="options-container">

        {helpTypes.map((helpType) => (

          <label
            key={helpType.id}
            className="option-label"
          >

            <input
              type="checkbox"
              checked={selectedHelpTypes.includes(
                helpType.id
              )}
              onChange={() =>
                handleChange(helpType.id)
              }
            />

            {helpType.name}

          </label>
        ))}

      </div>
    </div>
  );
}

export default HelpTypesSelector;