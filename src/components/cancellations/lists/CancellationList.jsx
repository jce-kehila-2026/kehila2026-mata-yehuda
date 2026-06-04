import CancellationCard from "./CancellationCard";

function CancellationList({ items, onMarkRefunded }) {
    if (items.length === 0) {
        return <p>אין בקשות ביטול להצגה</p>;
    }

    return (
        <div className="staff-grid staff-grid--cards staff-grid--detailed">
            {items.map((item) => (
                <CancellationCard
                    key={item.cancellation.id}
                    item={item}
                    onMarkRefunded={onMarkRefunded}
                />
            ))}
        </div>
    );
}

export default CancellationList;
