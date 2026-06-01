import { formatProgramTitle } from "../../utils/programConstants";

function ProgramCard({ program, isFixedProgram, onEdit, onDelete }) {
    const displayTitle = formatProgramTitle(program);
    const description = program.description?.trim();

    return (
        <article
            className={`program-card${isFixedProgram ? " program-card--fixed" : ""}`}
        >
            <div className="program-card__body">
                <h3 className="program-card__title">{displayTitle}</h3>
                {description && (
                    <p className="program-card__description">{description}</p>
                )}
            </div>

            <div className="program-card__actions">
                <button type="button" onClick={() => onEdit(program)}>
                    עריכה
                </button>
                {!isFixedProgram && (
                    <button type="button" onClick={() => onDelete(program.id)}>
                        מחיקה
                    </button>
                )}
            </div>
        </article>
    );
}

export default ProgramCard;
