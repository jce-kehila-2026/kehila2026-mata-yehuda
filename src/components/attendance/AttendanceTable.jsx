function AttendanceTable({
  participants,
  handleStatusChange,
  saveAttendance,
  hasSearched,
}) {

  const handleSaveClick = () => {

    const hasMissingStatus = participants.some(
      (participant) => participant.status === ""
    );

    if (hasMissingStatus) {
      alert("יש לבחור סטטוס לכל המשתתפים");
      return;
    }

    saveAttendance();
  };

  return (
    <div>

      <h2>רשימת משתתפים</h2>

      {participants.length === 0 ? (

        hasSearched && <p>לא נמצאו משתתפים</p>

      ) : (

        <>

          <table>

            <thead>
              <tr>
                <th>שם המשתתף</th>
                <th>טלפון</th>
                <th>סטטוס</th>
              </tr>
            </thead>

            <tbody>

              {participants.map((participant) => (

                <tr key={participant.registrationId}>

                  <td>{participant.participantName}</td>

                  <td>{participant.phone}</td>

                  <td>

                    <select
                      value={participant.status}
                      onChange={(e) =>
                        handleStatusChange(
                          participant.registrationId,
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        בחר סטטוס
                      </option>

                      <option value="present">
                        נוכח
                      </option>

                      <option value="absent">
                        נעדר
                      </option>

                      <option value="late">
                        איחור
                      </option>

                    </select>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          <button onClick={handleSaveClick}>
            שמור נוכחות
          </button>

        </>

      )}

    </div>
  );
}

export default AttendanceTable;