import { BadgeCheck, Ban, Clock, Wallet } from "lucide-react";
import { buildCancellationSummaryItems } from "./helpers/cancellationHelpers";

const STAT_ICONS = {
    total: Ban,
    pending: Clock,
    refunded: BadgeCheck,
    pendingRefundAmount: Wallet
};

function CancellationListStats({ stats }) {
    const items = buildCancellationSummaryItems(stats);

    if (!items.length) {
        return null;
    }

    return (
        <div className="list-mgmt-summary" aria-label="סיכום ביטולים">
            {items.map((item) => {
                const Icon = STAT_ICONS[item.key] || Ban;

                return (
                    <div key={item.key} className="list-mgmt-summary__item">
                        <span
                            className="list-mgmt-summary__icon"
                            aria-hidden="true"
                        >
                            <Icon
                                className="list-mgmt-summary__icon-glyph"
                                strokeWidth={2}
                            />
                        </span>
                        <span className="list-mgmt-summary__value">
                            {item.value}
                        </span>
                        <span className="list-mgmt-summary__label">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default CancellationListStats;
