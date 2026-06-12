import { formatActivityDisplayDate } from "../../services/attendance/attendanceService";

function AttendanceRecordsTable({ records }) {
  if (!records.length) {
    return (
      <div className="attendance-records-page__section">
        <h2 className="attendance-records-page__section-title">רשימת נוכחות</h2>
        <div className="attendance-records-page__card">
          <p className="attendance-records-page__empty">לא נמצאו רשומות נוכחות.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-records-page__section">
      <h2 className="attendance-records-page__section-title">רשימת נוכחות</h2>

      <div className="attendance-records-page__card">
        <div className="attendance-records-page__table-wrapper">
          <table className="attendance-records-page__table">
            <thead>
              <tr>
                <th>משתתף</th>
                <th>טלפון</th>
                <th>סטטוס</th>
                <th>הערות</th>
                <th>תאריך נוכחות</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="attendance-records-page__row">
                  <td data-label="משתתף">{record.participantName}</td>
                  <td data-label="טלפון">{record.phone || "—"}</td>
                  <td data-label="סטטוס">
                    {record.status ? (
                      <span
                        className={`attendance-records-page__status attendance-records-page__status--${
                          record.status === "present" ? "present" : "absent"
                        }`}
                      >
                        {record.statusLabel}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="הערות">{record.notes || "—"}</td>
                  <td data-label="תאריך נוכחות">
                    {formatActivityDisplayDate(record.attendanceDate) || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttendanceRecordsTable;
