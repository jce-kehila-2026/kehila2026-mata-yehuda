import {
    getRefundStatusBadgeVariant,
    getRefundStatusLabel
} from "./helpers/cancellationHelpers";

function CancellationRefundStatusBadge({ status }) {
    const label = getRefundStatusLabel(status);
    const variant = getRefundStatusBadgeVariant(status);

    return (
        <span
            className={`cancellation-refund-badge cancellation-refund-badge--${variant}`}
        >
            {label}
        </span>
    );
}

export default CancellationRefundStatusBadge;
