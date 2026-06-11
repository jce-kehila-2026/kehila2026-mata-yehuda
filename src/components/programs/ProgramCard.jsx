import { formatProgramTitle } from "../../utils/staffManegmentUtils/programConstants";
import { hasValue } from "../../utils/staffManegmentUtils/hasValue";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton
} from "../admin/AdminTableActions";

function ProgramCard({
    program,
    isFixedProgram,
    onEdit,
    onDelete,
    systemDeleteNote = "תוכנית מערכת - לא ניתן למחוק"
}) {
    const displayTitle = formatProgramTitle(program);
    const description = program.description?.trim();
    const imageUrl = program.image_url?.trim();

    return (
        <article
            className={`program-card${isFixedProgram ? " program-card--fixed" : ""}`}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={displayTitle || "תמונת תוכנית"}
                    className="program-card__image"
                    onError={(event) => {
                        event.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                <div className="program-card__image-placeholder" aria-hidden="true">
                    ללא תמונה
                </div>
            )}

            <div className="program-card__body">
                {hasValue(displayTitle) && (
                    <h3 className="program-card__title">{displayTitle}</h3>
                )}
                {hasValue(description) && (
                    <p className="program-card__description">{description}</p>
                )}
            </div>

            <div className="program-card__actions">
                <AdminTableActions>
                    <AdminTableEditButton onClick={() => onEdit(program)} />
                    {isFixedProgram ? (
                        <span
                            className="program-list__system-note"
                            title={systemDeleteNote}
                        >
                            {systemDeleteNote}
                        </span>
                    ) : (
                        <AdminTableDeleteButton
                            onClick={() => onDelete(program.id)}
                        />
                    )}
                </AdminTableActions>
            </div>
        </article>
    );
}

export default ProgramCard;
