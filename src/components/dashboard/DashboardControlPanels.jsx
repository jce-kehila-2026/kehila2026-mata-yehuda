import { formatCancellationDate } from "../cancellations/helpers/cancellationHelpers";
import { getRequestProgramLabel } from "../../services/dashboardService";
import { formatDate } from "../../utils/dateUtils";

function formatMessageSentDate(value) {
    if (!value) {
        return "—";
    }

    let date;

    if (value.toDate) {
        date = value.toDate();
    } else if (value.seconds) {
        date = new Date(value.seconds * 1000);
    } else {
        const parsed = new Date(value);
        date = Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (!date) {
        return "—";
    }

    return date.toLocaleDateString("he-IL");
}

function getMessagePreview(message) {
    const title = String(message?.title ?? "").trim();
    const body = String(message?.body ?? "").trim();

    if (title) {
        return title;
    }

    if (body.length <= 80) {
        return body;
    }

    return `${body.slice(0, 80)}…`;
}

function DashboardControlPanels({ overview, loading, onNavigate }) {
    const pendingCount = overview?.pendingCount ?? 0;
    const pendingRequests = overview?.pendingRequests ?? [];
    const upcomingActivities = overview?.upcomingActivities ?? [];
    const recentCancellations = overview?.recentCancellations ?? [];
    const latestMessage = overview?.latestMessage ?? null;

    return (
        <div className="staff-dashboard-panels">
            <section className="staff-dashboard-panel">
                <h3 className="staff-dashboard-panel__title">בקשות ממתינות</h3>
                {loading ? (
                    <p className="staff-dashboard-panel__loading">טוען…</p>
                ) : (
                    <>
                        <p className="staff-dashboard-panel__count">{pendingCount}</p>
                        {pendingRequests.length === 0 ? (
                            <p className="staff-dashboard-panel__empty">
                                אין בקשות ממתינות
                            </p>
                        ) : (
                            <ul className="staff-dashboard-panel__list">
                                {pendingRequests.map((request) => {
                                    const programLabel = getRequestProgramLabel(request);

                                    return (
                                        <li
                                            key={
                                                request.registrationId ||
                                                request.participant_id ||
                                                request.id
                                            }
                                            className="staff-dashboard-panel__item"
                                        >
                                            <span className="staff-dashboard-panel__item-name">
                                                {request.full_name || "—"}
                                            </span>
                                            {programLabel ? (
                                                <span className="staff-dashboard-panel__item-meta">
                                                    {programLabel}
                                                </span>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <div className="staff-dashboard-panel__footer">
                            <button
                                type="button"
                                className="staff-button staff-button--small"
                                onClick={() => onNavigate("requests")}
                            >
                                צפייה בכל הבקשות
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section className="staff-dashboard-panel">
                <h3 className="staff-dashboard-panel__title">פעילויות קרובות</h3>
                {loading ? (
                    <p className="staff-dashboard-panel__loading">טוען…</p>
                ) : upcomingActivities.length === 0 ? (
                    <p className="staff-dashboard-panel__empty">אין פעילויות קרובות</p>
                ) : (
                    <ul className="staff-dashboard-panel__list">
                        {upcomingActivities.map((activity) => (
                            <li key={activity.id} className="staff-dashboard-panel__item">
                                <span className="staff-dashboard-panel__item-name">
                                    {activity.data?.name || "—"}
                                </span>
                                <span className="staff-dashboard-panel__item-meta">
                                    {formatDate(activity.data?.start_date) || "—"}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="staff-dashboard-panel__footer">
                    <button
                        type="button"
                        className="staff-button staff-button--small"
                        onClick={() => onNavigate("activities")}
                        disabled={loading}
                    >
                        ניהול פעילויות
                    </button>
                </div>
            </section>

            <section className="staff-dashboard-panel">
                <h3 className="staff-dashboard-panel__title">ביטולים חדשים</h3>
                {loading ? (
                    <p className="staff-dashboard-panel__loading">טוען…</p>
                ) : recentCancellations.length === 0 ? (
                    <p className="staff-dashboard-panel__empty">אין ביטולים חדשים</p>
                ) : (
                    <ul className="staff-dashboard-panel__list">
                        {recentCancellations.map((item) => (
                            <li
                                key={item.cancellation.id}
                                className="staff-dashboard-panel__item"
                            >
                                <span className="staff-dashboard-panel__item-name">
                                    {item.participantFullName || "—"}
                                </span>
                                <span className="staff-dashboard-panel__item-meta">
                                    {formatCancellationDate(
                                        item.cancellation.cancelled_at
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="staff-dashboard-panel__footer">
                    <button
                        type="button"
                        className="staff-button staff-button--small"
                        onClick={() => onNavigate("cancellations")}
                        disabled={loading}
                    >
                        ניהול ביטולים
                    </button>
                </div>
            </section>

            <section className="staff-dashboard-panel">
                <h3 className="staff-dashboard-panel__title">הודעות אחרונות</h3>
                {loading ? (
                    <p className="staff-dashboard-panel__loading">טוען…</p>
                ) : !latestMessage ? (
                    <p className="staff-dashboard-panel__empty">
                        לא נשלחו הודעות עדיין
                    </p>
                ) : (
                    <div className="staff-dashboard-panel__message">
                        <p className="staff-dashboard-panel__message-preview">
                            {getMessagePreview(latestMessage)}
                        </p>
                        <p className="staff-dashboard-panel__message-meta">
                            <span>
                                נשלח: {formatMessageSentDate(latestMessage.created_at)}
                            </span>
                            <span>
                                נמענים: {latestMessage.recipient_count ?? 0}
                            </span>
                        </p>
                    </div>
                )}
                <div className="staff-dashboard-panel__footer">
                    <button
                        type="button"
                        className="staff-button staff-button--small"
                        onClick={() => onNavigate("messages")}
                        disabled={loading}
                    >
                        שליחת הודעות
                    </button>
                </div>
            </section>
        </div>
    );
}

export default DashboardControlPanels;
