import {
    DAY_CENTER_ID,
    DAY_CENTER_NAME,
    PROGRAM_60_PLUS_MINUS_DISPLAY_NAME,
    PROGRAM_60_PLUS_MINUS_ID,
    SUPPORTIVE_COMMUNITY_ID,
    SUPPORTIVE_COMMUNITY_NAME,
    getFixedProgramTitle,
    resolveCanonicalProgramId
} from "./programConstants";
import {
    isPendingPaymentStatus,
    isRegisteredStatus
} from "./participantStatusLabels";

const SUMMARY_PROGRAMS = [
    { id: DAY_CENTER_ID, label: DAY_CENTER_NAME },
    { id: PROGRAM_60_PLUS_MINUS_ID, label: PROGRAM_60_PLUS_MINUS_DISPLAY_NAME },
    { id: SUPPORTIVE_COMMUNITY_ID, label: SUPPORTIVE_COMMUNITY_NAME }
];

export function computeParticipantListStats(participants = []) {
    const stats = {
        total: participants.length,
        registered: 0,
        pendingPayment: 0,
        programs: {}
    };

    SUMMARY_PROGRAMS.forEach((program) => {
        stats.programs[program.id] = 0;
    });

    participants.forEach((participant) => {
        if (isRegisteredStatus(participant.registration_status)) {
            stats.registered += 1;
        }

        if (
            isPendingPaymentStatus(
                participant.registration_status,
                participant.payment_status
            )
        ) {
            stats.pendingPayment += 1;
        }

        const programId = resolveCanonicalProgramId(participant.program_id);

        if (programId && programId in stats.programs) {
            stats.programs[programId] += 1;
        }
    });

    return stats;
}

export function buildParticipantSummaryItems(stats) {
    if (!stats) {
        return [];
    }

    const items = [
        { key: "total", label: "סה״כ משתתפים", value: stats.total },
        { key: "registered", label: "רשומים", value: stats.registered },
        {
            key: "pendingPayment",
            label: "ממתינים לתשלום",
            value: stats.pendingPayment
        }
    ];

    SUMMARY_PROGRAMS.forEach((program) => {
        items.push({
            key: program.id,
            label: getFixedProgramTitle(program.id) || program.label,
            value: stats.programs[program.id] || 0,
            ltr: program.id === PROGRAM_60_PLUS_MINUS_ID
        });
    });

    return items;
}
