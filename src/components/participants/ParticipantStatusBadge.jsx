import {
    getPaymentStatusBadgeVariant,
    getPaymentStatusLabel,
    getRegistrationStatusBadgeVariant,
    getRegistrationStatusLabel,
    UNKNOWN_STATUS_LABEL
} from "../../utils/staffManegmentUtils/participantStatusLabels";

function ParticipantStatusBadge({ type, status }) {
    const label =
        type === "payment"
            ? getPaymentStatusLabel(status)
            : getRegistrationStatusLabel(status);

    const variant =
        type === "payment"
            ? getPaymentStatusBadgeVariant(status)
            : getRegistrationStatusBadgeVariant(status);

    const displayLabel = label || UNKNOWN_STATUS_LABEL;
    const displayVariant = variant || "muted";

    return (
        <span
            className={`participant-status-badge participant-status-badge--${displayVariant}`}
        >
            {displayLabel}
        </span>
    );
}

export default ParticipantStatusBadge;
