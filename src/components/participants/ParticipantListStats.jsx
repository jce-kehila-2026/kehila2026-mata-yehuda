import { buildParticipantSummaryItems } from "../../utils/participantListStats";
import { shouldDisplayProgramTitleLtr } from "../../utils/programConstants";

function ProgramDisplayName({ title }) {
    if (!title || title === "—") {
        return "—";
    }

    if (shouldDisplayProgramTitleLtr(title)) {
        return (
            <span className="program-display-name program-display-name--ltr" dir="ltr">
                {title}
            </span>
        );
    }

    return title;
}

function MaskedIdDisplay({ idNumber }) {
    return (
        <span className="admin-data-table__masked-id" dir="ltr">
            {idNumber}
        </span>
    );
}

function ParticipantListStats({ stats }) {
    const items = buildParticipantSummaryItems(stats);

    if (!items.length) {
        return null;
    }

    return (
        <div className="participant-list-stats" aria-label="סיכום משתתפים">
            {items.map((item) => (
                <div key={item.key} className="participant-list-stats__item">
                    <span className="participant-list-stats__label">
                        {item.ltr ? (
                            <ProgramDisplayName title={item.label} />
                        ) : (
                            item.label
                        )}
                    </span>
                    <span className="participant-list-stats__value">{item.value}</span>
                </div>
            ))}
        </div>
    );
}

export { MaskedIdDisplay, ParticipantListStats, ProgramDisplayName };
