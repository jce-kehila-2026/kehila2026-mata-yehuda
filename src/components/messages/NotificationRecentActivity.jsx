import { formatDate } from "../../utils/staffManegmentUtils/dateUtils";
import { getNotificationTargetGroupLabel } from "./helpers/messageHelpers";
import { hasFormattedDisplay } from "../../utils/staffManegmentUtils/hasValue";

function NotificationRecentActivity({ items = [], loading }) {
    return (
        <section className="notifications-activity" aria-labelledby="notifications-activity-title">
            <div className="notifications-activity__header">
                <h2 id="notifications-activity-title" className="notifications-activity__title">
                    פעילות אחרונה
                </h2>
                <p className="notifications-activity__subtitle">
                    התראות שנשלחו לאחרונה מהמערכת
                </p>
            </div>

            {loading ? (
                <p className="notifications-activity__loading">טוען פעילות...</p>
            ) : null}

            {!loading && items.length === 0 ? (
                <div className="notifications-activity__empty">
                    <p>עדיין לא נשלחו התראות מהמערכת</p>
                </div>
            ) : null}

            {!loading && items.length > 0 ? (
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
                                {items.map((item) => {
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
                        {items.map((item) => {
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
                </>
            ) : null}
        </section>
    );
}

export default NotificationRecentActivity;
