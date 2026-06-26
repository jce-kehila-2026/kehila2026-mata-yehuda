import { useEffect, useMemo, useState } from "react";
import { formatDate } from "../../utils/staffManegmentUtils/dateUtils";
import { getNotificationTargetGroupLabel } from "./helpers/messageHelpers";
import { hasFormattedDisplay } from "../../utils/staffManegmentUtils/hasValue";

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const DEFAULT_PAGE_SIZE = 10;

function getSentMillis(value) {
    if (!value) {
        return 0;
    }

    if (typeof value.toDate === "function") {
        return value.toDate().getTime();
    }

    if (typeof value.seconds === "number") {
        return value.seconds * 1000;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function NotificationRecentActivity({ items = [], loading }) {
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [page, setPage] = useState(1);

    const sortedItems = useMemo(
        () =>
            [...items].sort(
                (a, b) => getSentMillis(b.sentAt) - getSentMillis(a.sentAt)
            ),
        [items]
    );

    const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
    const currentPage = Math.min(page, totalPages);

    useEffect(() => {
        if (page !== currentPage) {
            setPage(currentPage);
        }
    }, [page, currentPage]);

    const pageItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedItems.slice(start, start + pageSize);
    }, [sortedItems, currentPage, pageSize]);

    function handlePageSizeChange(event) {
        setPageSize(Number(event.target.value));
        setPage(1);
    }

    const hasItems = !loading && sortedItems.length > 0;

    return (
        <section className="notifications-activity" aria-labelledby="notifications-activity-title">
            <div className="notifications-activity__header">
                <div className="notifications-activity__header-main">
                    <h2 id="notifications-activity-title" className="notifications-activity__title">
                        פעילות אחרונה
                    </h2>
                    <p className="notifications-activity__subtitle">
                        הודעות שנשלחו לאחרונה מהמערכת
                    </p>
                </div>

                {hasItems ? (
                    <div className="notifications-activity__page-size">
                        <label htmlFor="notifications-activity-page-size">
                            מספר הודעות בעמוד
                        </label>
                        <select
                            id="notifications-activity-page-size"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                        >
                            {PAGE_SIZE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
            </div>

            {loading ? (
                <p className="notifications-activity__loading">טוען פעילות...</p>
            ) : null}

            {!loading && sortedItems.length === 0 ? (
                <div className="notifications-activity__empty">
                    <p>עדיין לא נשלחו הודעות מהמערכת</p>
                </div>
            ) : null}

            {hasItems ? (
                <>
                    <div className="notifications-activity__table-wrap notifications-activity__table-wrap--desktop">
                        <table className="notifications-activity__table">
                            <thead>
                                <tr>
                                    <th scope="col">כותרת</th>
                                    <th scope="col">תוכן</th>
                                    <th scope="col">תאריך</th>
                                    <th scope="col">נמענים</th>
                                    <th scope="col">קבוצה</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((item) => {
                                    const sentDate = formatDate(item.sentAt);
                                    const recipientCount =
                                        item.totalTokens ?? item.successCount ?? 0;

                                    return (
                                        <tr key={item.id}>
                                            <td className="notifications-activity__table-title">
                                                {item.title || "ללא כותרת"}
                                            </td>
                                            <td className="notifications-activity__table-body">
                                                {item.body || "—"}
                                            </td>
                                            <td>
                                                {hasFormattedDisplay(sentDate)
                                                    ? sentDate
                                                    : "—"}
                                            </td>
                                            <td>{recipientCount}</td>
                                            <td>
                                                {getNotificationTargetGroupLabel(
                                                    item.targetGroup
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <ul className="notifications-activity__list notifications-activity__list--mobile">
                        {pageItems.map((item) => {
                            const sentDate = formatDate(item.sentAt);
                            const recipientCount =
                                item.totalTokens ?? item.successCount ?? 0;

                            return (
                                <li key={item.id} className="notifications-activity__item">
                                    <div className="notifications-activity__item-main">
                                        <h3 className="notifications-activity__item-title">
                                            {item.title || "ללא כותרת"}
                                        </h3>
                                        <p className="notifications-activity__item-body">
                                            {item.body || "—"}
                                        </p>
                                    </div>
                                    <div className="notifications-activity__item-meta">
                                        <span>
                                            {hasFormattedDisplay(sentDate)
                                                ? sentDate
                                                : "—"}
                                        </span>
                                        <span>
                                            {recipientCount} נמענים ·{" "}
                                            {getNotificationTargetGroupLabel(
                                                item.targetGroup
                                            )}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="messages-mgmt-pagination">
                        <button
                            type="button"
                            className="messages-mgmt-pagination__btn"
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                        >
                            הקודם
                        </button>
                        <span className="messages-mgmt-pagination__label">
                            עמוד {currentPage} מתוך {totalPages}
                        </span>
                        <button
                            type="button"
                            className="messages-mgmt-pagination__btn"
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                        >
                            הבא
                        </button>
                    </div>
                </>
            ) : null}
        </section>
    );
}

export default NotificationRecentActivity;
