import { Calendar, Check, ClipboardList, Undo2 } from "lucide-react";
import { formatCancellationDate } from "../cancellations/helpers/cancellationHelpers";
import { getRequestProgramLabel } from "../../services/dashboardService";
import { formatDate } from "../../utils/dateUtils";
import {
    buildRecentUpdates,
    formatRelativeTimeHebrew,
    getWeekActivities,
    RECENT_UPDATES_PLACEHOLDERS
} from "../../utils/dashboardDisplayHelpers";

const PANEL_PREVIEW_LIMIT = 3;

function DashboardPanelEmpty({ message, icon: EmptyIcon = Check }) {
    return (
        <div className="staff-dashboard-panel__empty-state">
            <span className="staff-dashboard-panel__empty-icon-wrap" aria-hidden="true">
                <EmptyIcon
                    className="staff-dashboard-panel__empty-icon"
                    strokeWidth={2}
                />
            </span>
            <p className="staff-dashboard-panel__empty-text">{message}</p>
        </div>
    );
}

function DashboardPanelLink({ label, onClick, disabled }) {
    return (
        <div className="staff-dashboard-panel__footer">
            <button
                type="button"
                className="staff-dashboard-panel__link"
                onClick={onClick}
                disabled={disabled}
            >
                {label}
            </button>
        </div>
    );
}

function DashboardControlPanels({ overview, loading, onNavigate }) {
    const pendingCount = overview?.pendingCount ?? 0;
    const pendingRequests = (overview?.pendingRequests ?? []).slice(
        0,
        PANEL_PREVIEW_LIMIT
    );
    const upcomingActivities = (overview?.upcomingActivities ?? []).slice(
        0,
        PANEL_PREVIEW_LIMIT
    );
    const recentCancellations = (overview?.recentCancellations ?? []).slice(
        0,
        PANEL_PREVIEW_LIMIT
    );
    const cancellationCount = overview?.cancellationCount ?? recentCancellations.length;
    const recentUpdates = buildRecentUpdates(overview).slice(0, PANEL_PREVIEW_LIMIT);
    const weekActivities = getWeekActivities(overview?.upcomingActivities ?? []).slice(
        0,
        PANEL_PREVIEW_LIMIT
    );
    const showPlaceholderUpdates = !loading && recentUpdates.length === 0;

    return (
        <div className="staff-dashboard-panels">
            <section className="staff-dashboard-panel">
                <h3 className="staff-dashboard-panel__title">בקשות ממתינות</h3>
                <div className="staff-dashboard-panel__body">
                    {loading ? (
                        <p className="staff-dashboard-panel__loading">טוען…</p>
                    ) : (
                        <>
                            <p className="staff-dashboard-panel__count">{pendingCount}</p>
                            {pendingRequests.length === 0 ? (
                                <DashboardPanelEmpty
                                    message="אין בקשות ממתינות"
                                    icon={ClipboardList}
                                />
                            ) : (
                                <ul className="staff-dashboard-panel__list">
                                    {pendingRequests.map((request) => {
                                        const programLabel =
                                            getRequestProgramLabel(request);

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
                        </>
                    )}
                </div>
                <DashboardPanelLink
                    label="צפייה בכל הבקשות →"
                    onClick={() => onNavigate("registrations")}
                    disabled={loading}
                />
            </section>

            <section className="staff-dashboard-panel">
                <h3 className="staff-dashboard-panel__title">פעילויות קרובות</h3>
                <div className="staff-dashboard-panel__body">
                    {loading ? (
                        <p className="staff-dashboard-panel__loading">טוען…</p>
                    ) : upcomingActivities.length === 0 ? (
                        <DashboardPanelEmpty
                            message="אין פעילויות קרובות"
                            icon={Calendar}
                        />
                    ) : (
                        <ul className="staff-dashboard-panel__list">
                            {upcomingActivities.map((activity) => (
                                <li
                                    key={activity.id}
                                    className="staff-dashboard-panel__item"
                                >
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
                </div>
                <DashboardPanelLink
                    label="צפייה בכל הפעילויות →"
                    onClick={() => onNavigate("activities")}
                    disabled={loading}
                />
            </section>

            <section className="staff-dashboard-panel">
                <h3 className="staff-dashboard-panel__title">ביטולים חדשים</h3>
                <div className="staff-dashboard-panel__body">
                    {loading ? (
                        <p className="staff-dashboard-panel__loading">טוען…</p>
                    ) : recentCancellations.length === 0 ? (
                        cancellationCount > 0 ? (
                            <p className="staff-dashboard-panel__count">
                                {cancellationCount} ביטולים
                            </p>
                        ) : (
                            <DashboardPanelEmpty
                                message="אין ביטולים חדשים"
                                icon={Undo2}
                            />
                        )
                    ) : (
                        <>
                            <p className="staff-dashboard-panel__count staff-dashboard-panel__count--compact">
                                {cancellationCount} ביטולים
                            </p>
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
                        </>
                    )}
                </div>
                <DashboardPanelLink
                    label="צפייה בכל הביטולים →"
                    onClick={() => onNavigate("cancellations")}
                    disabled={loading}
                />
            </section>

            <section className="staff-dashboard-panel staff-dashboard-panel--updates staff-dashboard-panel--mobile-only">
                <h3 className="staff-dashboard-panel__title">עדכונים אחרונים</h3>
                <div className="staff-dashboard-panel__body">
                    {loading ? (
                        <p className="staff-dashboard-panel__loading">טוען…</p>
                    ) : showPlaceholderUpdates ? (
                        <ul className="staff-dashboard-updates">
                            {RECENT_UPDATES_PLACEHOLDERS.map((item) => (
                                <li
                                    key={item.id}
                                    className="staff-dashboard-updates__item staff-dashboard-updates__item--placeholder"
                                >
                                    <span className="staff-dashboard-updates__title">
                                        {item.title}
                                    </span>
                                    <span className="staff-dashboard-updates__meta">
                                        {item.timeLabel}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="staff-dashboard-updates">
                            {recentUpdates.map((update) => (
                                <li key={update.id} className="staff-dashboard-updates__item">
                                    <button
                                        type="button"
                                        className="staff-dashboard-updates__button"
                                        onClick={() => onNavigate(update.page)}
                                    >
                                        <span className="staff-dashboard-updates__title">
                                            {update.title}
                                        </span>
                                        <span className="staff-dashboard-updates__meta">
                                            {formatRelativeTimeHebrew(update.timestamp)}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            {!loading && weekActivities.length > 0 ? (
                <section className="staff-dashboard-panel staff-dashboard-panel--week staff-dashboard-panel--mobile-only">
                    <h3 className="staff-dashboard-panel__title">פעילויות השבוע</h3>
                    <div className="staff-dashboard-panel__body">
                        <ul className="staff-dashboard-week">
                            {weekActivities.map((activity) => (
                                <li key={activity.id} className="staff-dashboard-week__item">
                                    <span className="staff-dashboard-week__name">
                                        {activity.data?.name || "—"}
                                    </span>
                                    <span className="staff-dashboard-week__date">
                                        {formatDate(activity.data?.start_date) || "—"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <DashboardPanelLink
                        label="צפייה בכל הפעילויות →"
                        onClick={() => onNavigate("activities")}
                        disabled={loading}
                    />
                </section>
            ) : null}
        </div>
    );
}

export default DashboardControlPanels;
