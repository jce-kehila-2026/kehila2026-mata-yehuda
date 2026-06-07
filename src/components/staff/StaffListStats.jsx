import { buildStaffSummaryItems } from "../../utils/staffListStats";

function StaffListStats({ stats }) {
    const items = buildStaffSummaryItems(stats);

    if (!items.length) {
        return null;
    }

    return (
        <div className="staff-list-stats" aria-label="סיכום אנשי צוות">
            {items.map((item) => (
                <div key={item.key} className="staff-list-stats__item">
                    <span className="staff-list-stats__label">{item.label}</span>
                    <span className="staff-list-stats__value">{item.value}</span>
                </div>
            ))}
        </div>
    );
}

export default StaffListStats;
