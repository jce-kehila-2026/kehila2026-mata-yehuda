import { Users, UserCheck, UserX } from "lucide-react";
import { buildStaffSummaryItems } from "../../utils/staffManegmentUtils/staffListStats";

const STAT_ICONS = {
    total: Users,
    active: UserCheck,
    inactive: UserX
};

function StaffListStats({ stats }) {
    const items = buildStaffSummaryItems(stats);

    if (!items.length) {
        return null;
    }

    return (
        <div className="list-mgmt-summary" aria-label="סיכום אנשי צוות">
            {items.map((item) => {
                const Icon = STAT_ICONS[item.key] || Users;

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

export default StaffListStats;
