import "../../styles/attendance/AttendanceButtons.css";

function AttendanceTable({
  classPrefix = "take-attendance-page",
  participants,  handleStatusChange,
  handleNotesChange,
  saveAttendance,
  onShowMessage,
  hasSearched,
  searchSummary,
  showActivityColumn,
}) {
  const handleSaveClick = () => {
    const hasMissingStatus = participants.some(
      (participant) => participant.status === ""
    );

    if (hasMissingStatus) {
      onShowMessage?.("error", "יש לבחור סטטוס לכל המשתתפים");
      return;
    }

    saveAttendance();
  };

  const showEmptyState = hasSearched && participants.length === 0;

  return (
    <div className={`${classPrefix}__section`}>
      {hasSearched && searchSummary && (
        <h2 className={`${classPrefix}__section-title`}>
          רשימת משתתפים — {searchSummary}
        </h2>
      )}

      {showEmptyState ? (
        <div className={`${classPrefix}__card`}>
          <p className={`${classPrefix}__empty`}>לא נמצאו משתתפים</p>
        </div>
      ) : participants.length > 0 ? (
        <div className={`${classPrefix}__card`}>
          <div className={`${classPrefix}__table-wrapper`}>
            <table className={`${classPrefix}__table attendance-table`}>
              <thead>
                <tr>
                  {showActivityColumn && <th className="attendance-table__col-activity">פעילות</th>}
                  <th className="attendance-table__col-name">שם המשתתף</th>
                  <th className="attendance-table__col-phone">טלפון</th>
                  <th className="attendance-table__col-status">סטטוס</th>
                  <th className="attendance-table__col-notes">הערות</th>
                </tr>
              </thead>

              <tbody>
                {participants.map((participant) => (
                  <tr
                    key={`${participant.activityId}-${participant.registrationId}`}
                    className={`${classPrefix}__row`}
                  >
                    {showActivityColumn && (
                      <td data-label="פעילות">
                        {participant.activityName || "—"}
                      </td>
                    )}

                    <td data-label="שם המשתתף">
                      {participant.participantName}
                    </td>

                    <td data-label="טלפון">{participant.phone}</td>

                    <td data-label="סטטוס">
                      <div className="attendance-table__status-actions">
                        <button
                          type="button"
                          className={`attendance-status-btn attendance-status-btn--present${
                            participant.status === "present"
                              ? " attendance-status-btn--selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleStatusChange(
                              participant.registrationId,
                              "present"
                            )
                          }
                        >
                          נוכח
                        </button>

                        <button
                          type="button"
                          className={`attendance-status-btn attendance-status-btn--absent${
                            participant.status === "absent"
                              ? " attendance-status-btn--selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleStatusChange(
                              participant.registrationId,
                              "absent"
                            )
                          }
                        >
                          נעדר
                        </button>
                      </div>
                    </td>

                    <td data-label="הערות">
                      <input
                        type="text"
                        className="attendance-table__notes-input"
                        value={participant.notes || ""}
                        placeholder="הערות"
                        onChange={(event) =>
                          handleNotesChange(
                            participant.registrationId,
                            event.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`${classPrefix}__actions`}>
            <button
              type="button"
              className="attendance-btn attendance-btn--primary"
              onClick={handleSaveClick}
            >
              שמור נוכחות
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AttendanceTable;
