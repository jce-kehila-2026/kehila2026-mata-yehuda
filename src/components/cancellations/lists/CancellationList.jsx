import CancellationCard from "./CancellationCard";

function CancellationList({ items, onMarkRefunded }) {
    if (items.length === 0) {
        return <p>אין בקשות ביטול להצגה</p>;
    }

    return (
        <div>
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
