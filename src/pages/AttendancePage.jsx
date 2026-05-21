import { useState } from "react";
import AttendanceSearch from "../components/attendance/AttendanceSearch";
import AttendanceTable from "../components/attendance/AttendanceTable";

import {
  getActivitiesBySearch,
  getConfirmedRegistrationsByActivity,
  saveAttendanceRecords,
} from "../services/attendanceService";

function AttendancePage() {
  const [activityName, setActivityName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const handleSearch = async () => {
    try {
        setHasSearched(true);
      const activities = await getActivitiesBySearch(activityName, selectedDate);

      if (activities.length === 0) {
        setFilteredParticipants([]);
        alert("לא נמצאה פעילות מתאימה");
        return;
      }

      const selectedActivity = activities[0];

      const registrations = await getConfirmedRegistrationsByActivity(
        selectedActivity.id
      );

      setFilteredParticipants(registrations);
    } catch (error) {
      console.error("Error searching attendance data:", error);
      alert("אירעה שגיאה בחיפוש");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedParticipants = filteredParticipants.map((participant) => {
      if (participant.registrationId === id) {
        return { ...participant, status: newStatus };
      }

      return participant;
    });

    setFilteredParticipants(updatedParticipants);
  };

  const saveAttendance = async () => {
    try {
      await saveAttendanceRecords(filteredParticipants, selectedDate, "staff1");
      alert("הנוכחות נשמרה בהצלחה");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("אירעה שגיאה בשמירת הנוכחות");
    }
  };

  return (
    <div>
      <h1>Attendance</h1>

      <AttendanceSearch
        activityName={activityName}
        setActivityName={setActivityName}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        handleSearch={handleSearch}
      />

     <AttendanceTable
  participants={filteredParticipants}
  handleStatusChange={handleStatusChange}
  saveAttendance={saveAttendance}
  hasSearched={hasSearched}
/>
    </div>
  );
}

export default AttendancePage;