import { useCallback, useEffect, useMemo, useState } from "react";
import CancellationList from "../components/cancellations/lists/CancellationList";
import {
    filterCancellationsByRefundStatus,
    REFUND_FILTERS,
    REFUND_FILTER_ALL
} from "../components/cancellations/helpers/cancellationHelpers";
import {
    getCancellationRequests,
    updateRefundStatus
} from "../services/cancellationService";

function ManageCancellations() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refundFilter, setRefundFilter] = useState(REFUND_FILTER_ALL);

    const loadCancellations = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getCancellationRequests();
            setItems(data);
        } catch (err) {
            console.log(err);
            setError("שגיאה בטעינת בקשות הביטול");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCancellations();
    }, [loadCancellations]);

    const filteredItems = useMemo(
        () => filterCancellationsByRefundStatus(items, refundFilter),
        [items, refundFilter]
    );

    async function handleMarkRefunded(cancellationId, payload) {
        await updateRefundStatus(cancellationId, payload);
        await loadCancellations();
    }

    return (
        <div>
            <h1>ניהול ביטולים</h1>

            <div className="staff-form staff-list-filters cancellation-filters">
                <label htmlFor="cancellation-refund-filter">סינון לפי החזר</label>
                <select
                    id="cancellation-refund-filter"
                    value={refundFilter}
                    onChange={(e) => setRefundFilter(e.target.value)}
                >
                    {REFUND_FILTERS.map((filter) => (
                        <option key={filter.id} value={filter.id}>
                            {filter.label}
                        </option>
                    ))}
                </select>

                <p className="staff-list-count">
                    מוצגים {filteredItems.length} מתוך {items.length}
                </p>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>טוען...</p>}

            {!loading && !error && (
                <CancellationList
                    items={filteredItems}
                    onMarkRefunded={handleMarkRefunded}
                />
            )}
        </div>
    );
}

export default ManageCancellations;
