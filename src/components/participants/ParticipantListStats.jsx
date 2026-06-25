import {
    ClipboardList,
    CreditCard,
    HeartHandshake,
    Sun,
    UserCheck,
    UserRound,
    Users
} from "lucide-react";
import { buildParticipantSummaryItems } from "../../utils/staffManegmentUtils/participantListStats";
import {
    DAY_CENTER_ID,
    PROGRAM_60_PLUS_MINUS_ID,
    SUPPORTIVE_COMMUNITY_ID,
    shouldDisplayProgramTitleLtr
} from "../../utils/staffManegmentUtils/programConstants";

const STAT_ICONS = {
    total: Users,
    registered: UserCheck,
    pendingPayment: CreditCard,
    [DAY_CENTER_ID]: Sun,
    [PROGRAM_60_PLUS_MINUS_ID]: UserRound,
    [SUPPORTIVE_COMMUNITY_ID]: HeartHandshake
};

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
            {items.map((item) => {
                const Icon = STAT_ICONS[item.key] || ClipboardList;

                return (
                    <div key={item.key} className="participant-list-stats__item">
                        <span
                            className="participant-list-stats__icon"
                            aria-hidden="true"
                        >
                            <Icon
                                className="participant-list-stats__icon-glyph"
                                strokeWidth={2}
                            />
                        </span>
                        <span className="participant-list-stats__value">
                            {item.value}
                        </span>
                        <span className="participant-list-stats__label">
                            {item.ltr ? (
                                <ProgramDisplayName title={item.label} />
                            ) : (
                                item.label
                            )}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export { MaskedIdDisplay, ParticipantListStats, ProgramDisplayName };
