import { formatProgramTitle } from "../../utils/programConstants";
import { hasValue } from "../../utils/hasValue";

function ProgramCard({ program, isFixedProgram, onEdit, onDelete }) {
    const displayTitle = formatProgramTitle(program);
    const description = program.description?.trim();

    return (
        <article
            className={`program-card${isFixedProgram ? " program-card--fixed" : ""}`}
        >
            <div className="program-card__body">
                {hasValue(displayTitle) && (
                    <h3 className="program-card__title">{displayTitle}</h3>
                )}
                {hasValue(description) && (
                    <p className="program-card__description">{description}</p>
                )}
            </div>

            <div className="program-card__actions">
                <button
                    type="button"
                    className="staff-button staff-button--small"
                    onClick={() => onEdit(program)}
                >
                    עריכה
                </button>
                {!isFixedProgram && (
                    <button
                        type="button"
                        className="staff-button staff-button--small staff-button--danger"
                        onClick={() => onDelete(program.id)}
                    >
                        מחיקה
                    </button>
                )}
            </div>
        </article>
    );
}

export default ProgramCard;
