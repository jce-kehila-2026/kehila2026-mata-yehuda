const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

function AvailabilitySelector({
  availability,
  setAvailability,
}) {
  const handleDayChange = (day) => {
    if (availability.includes(day)) {
      setAvailability(
        availability.filter(
          (item) => item !== day
        )
      );
    } else {
      setAvailability([
        ...availability,
        day,
      ]);
    }
  };

  return (
   
    <div className="options-container">
         <h3>בחר זמינות</h3>
  {days.map((day) => (
    <label key={day} className="option-label">
      <input
        type="checkbox"
        checked={availability.includes(day)}
        onChange={() => handleDayChange(day)}
      />
      {day}
    </label>
  ))}
</div>
  );
}

export default AvailabilitySelector;