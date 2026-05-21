function AttendanceSearch({
  activityName,
  setActivityName,
  selectedDate,
  setSelectedDate,
  handleSearch,
}) {
  return (
    <div>
      <h2>חיפוש נוכחות</h2>

      <label>שם הפעולה</label>
      <input
        type="text"
        value={activityName}
        onChange={(e) => setActivityName(e.target.value)}
      />

      <label>תאריך</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <button onClick={handleSearch}>חפש</button>
    </div>
  );
}

export default AttendanceSearch;