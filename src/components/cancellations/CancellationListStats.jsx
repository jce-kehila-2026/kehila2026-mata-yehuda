import { buildCancellationSummaryItems } from "./helpers/cancellationHelpers";

function CancellationListStats({ stats }) {
    const items = buildCancellationSummaryItems(stats);

    if (!items.length) {
        return null;
    }

    return (
        <div className="cancellation-list-stats" aria-label="סיכום ביטולים">
            {items.map((item) => (
                <div key={item.key} className="cancellation-list-stats__item">
                    <span className="cancellation-list-stats__label">{item.label}</span>
                    <span className="cancellation-list-stats__value">{item.value}</span>
                </div>
            ))}
        </div>
    );
}

export default CancellationListStats;
