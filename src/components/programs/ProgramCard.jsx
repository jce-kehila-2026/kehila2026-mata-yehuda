function ProgramCard({ program, isDayCenter, onEdit, onDelete }) {

    return (
        <div
            className={`staff-card${isDayCenter ? " staff-card-day-center" : ""}`}
        >
            <h3>{program.title}</h3>
            <p>{program.description || "—"}</p>

            {program.image_url && (
                <img
                    src={program.image_url}
                    alt={program.title}
                    className="day-center-preview"
                />
            )}

            <div className="row">
                <button onClick={() => onEdit(program)}>
                    עריכה
                </button>
                {!isDayCenter && (
                    <button onClick={() => onDelete(program.id)}>
                        מחיקה
                    </button>
                )}
            </div>
            <hr />
        </div>
    );
}

export default ProgramCard;
