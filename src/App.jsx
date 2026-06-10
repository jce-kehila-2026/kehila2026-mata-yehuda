import { useState } from "react";
import AttendancePage from "./pages/attendance/AttendancePage";
import TakeAttendancePage from "./pages/attendance/TakeAttendancePage";
import AttendanceRecordsPage from "./pages/attendance/AttendanceRecordsPage";

function App() {
  const [currentPage, setCurrentPage] = useState("menu");

  if (currentPage === "take") {
    return <TakeAttendancePage onBack={() => setCurrentPage("menu")} />;
  }

  if (currentPage === "records") {
    return <AttendanceRecordsPage onBack={() => setCurrentPage("menu")} />;
  }

  return <AttendancePage onNavigate={setCurrentPage} />;
}

export default App;
