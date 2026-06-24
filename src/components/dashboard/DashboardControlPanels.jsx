import { formatCancellationDate } from "../cancellations/helpers/cancellationHelpers";
import { getRequestProgramLabel } from "../../services/staffManegmentServices/dashboardService";
import { formatInquiryDate } from "../../services/staffManegmentServices/inquiryService";
import { getStaffInquiriesRoute } from "../../config/staffInquiriesNavigation";
import DashboardActivityCalendar from "./DashboardActivityCalendar";
import ActivityDateDisplay from "../activities/ActivityDateDisplay";
import { formatDate } from "../../utils/staffManegmentUtils/dateUtils";
import {
    buildRecentUpdates,
    formatRelativeTimeHebrew,
    getWeekActivities,
    RECENT_UPDATES_PLACEHOLDERS
} from "../../utils/staffManegmentUtils/dashboardDisplayHelpers";

const PANEL_PREVIEW_LIMIT = 3;
const PENDING_REQUESTS_PREVIEW_LIMIT = 2;
const INQUIRIES_PREVIEW_LIMIT = 2;

function getRegistrationActivityLabel(request) {
    const activityName = String(request?.activity_name ?? "").trim();

    if (activityName) {
        return activityName;
    }

    const programTitle = String(request?.program_title ?? "").trim();

    if (programTitle) {
        return programTitle;
    }

    return getRequestProgramLabel(request) || "—";
}

function getCancellationActivityLabel(item) {
    const activityName = String(item?.activityName ?? "").trim();

    if (activityName) {
        return activityName;
    }

    const programTitle = String(item?.programTitle ?? "").trim();

    return programTitle || "—";
}

function DashboardPanelRequestDetails({
    activityLabel,
    participantName,
    dateLabel
}) {
    return (
        <div className="staff-dashboard-panel__item-content staff-dashboard-panel__item-content--details">
            <div className="staff-dashboard-panel__item-detail">
                <span className="staff-dashboard-panel__item-label">פעילות:</span>
                <span className="staff-dashboard-panel__item-value">
                    {activityLabel || "—"}
                </span>
            </div>
            <div className="staff-dashboard-panel__item-detail">
                <span className="staff-dashboard-panel__item-label">משתתף/ת:</span>
                <span className="staff-dashboard-panel__item-value">
                    {participantName || "—"}
                </span>
            </div>
            {dateLabel ? (
                <div className="staff-dashboard-panel__item-detail">
                    <span className="staff-dashboard-panel__item-label">תאריך:</span>
                    <span className="staff-dashboard-panel__item-value">
                        {dateLabel}
                    </span>
                </div>
            ) : null}
        </div>
    );
}

function DashboardPanelEmpty({ message }) {
    return (
        <div className="staff-dashboard-panel__empty-state">
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

function DashboardControlPanels({
    overview,
    loading,
    onNavigate,
    onCompleteRegistration,
    onManageCancellation,
    onHandleInquiry
}) {
    const pendingCount = overview?.pendingCount ?? 0;
    const pendingRequests = (overview?.pendingRequests ?? []).slice(
        0,
        PENDING_REQUESTS_PREVIEW_LIMIT
    );
    const dashboardActivities = overview?.activities ?? [];
    const recentCancellations = (overview?.recentCancellations ?? []).slice(
        0,
        PANEL_PREVIEW_LIMIT
    );
    const cancellationCount = overview?.cancellationCount ?? recentCancellations.length;
    const recentInquiries = (overview?.recentInquiries ?? []).slice(
        0,
        INQUIRIES_PREVIEW_LIMIT
    );
    const inquiryCount = overview?.inquiryCount ?? recentInquiries.length;
    const inquiriesRoute = getStaffInquiriesRoute();
    const recentUpdates = buildRecentUpdates(overview).slice(0, PANEL_PREVIEW_LIMIT);
    const weekActivities = getWeekActivities(overview?.upcomingActivities ?? []).slice(
        0,
        PANEL_PREVIEW_LIMIT
    );
    const showPlaceholderUpdates = !loading && recentUpdates.length === 0;

    return (
        <div className="staff-dashboard-panels">
            <div className="staff-dashboard-panels__main">
            <section className="staff-dashboard-panel staff-dashboard-panel--summary">
                <h3 className="staff-dashboard-panel__title">פניות חדשות</h3>
                <div className="staff-dashboard-panel__body">
                    {loading ? (
                        <p className="staff-dashboard-panel__loading">טוען…</p>
                    ) : (
                        <>
                            <p className="staff-dashboard-panel__count">{inquiryCount}</p>
                            {recentInquiries.length === 0 ? (
                                <DashboardPanelEmpty message="אין פניות חדשות" />
                            ) : (
                                <ul className="staff-dashboard-panel__list">
                                    {recentInquiries.map((inquiry) => {
                                        const inquiryDate = formatInquiryDate(
                                            inquiry.createdAt
                                        );

                                        return (
                                            <li
                                                key={inquiry.id}
                                                className="staff-dashboard-panel__item staff-dashboard-panel__item--with-action"
                                            >
                                                <div className="staff-dashboard-panel__item-content">
                                                    <span className="staff-dashboard-panel__item-name">
                                                        {inquiry.senderName || "—"}
                                                    </span>
                                                    {inquiry.subject ? (
                                                        <span className="staff-dashboard-panel__item-meta">
                                                            {inquiry.subject}
                                                        </span>
                                                    ) : null}
                                                    {inquiryDate ? (
                                                        <span className="staff-dashboard-panel__item-meta">
                                                            {inquiryDate}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="staff-dashboard-panel__item-action"
                                                    onClick={() =>
                                                        onHandleInquiry?.(inquiry)
                                                    }
                                                >
                                                    טיפול בפנייה
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </>
                    )}
                </div>
                <DashboardPanelLink
                    label="צפייה בכל הפניות →"
                    onClick={() => onNavigate(inquiriesRoute)}
                    disabled={loading}
                />
            </section>

            <DashboardActivityCalendar
                activities={dashboardActivities}
                loading={loading}
                onNavigate={onNavigate}
            />

            <section className="staff-dashboard-panel staff-dashboard-panel--summary">
                <h3 className="staff-dashboard-panel__title">בקשות ממתינות</h3>
                <div className="staff-dashboard-panel__body">
                    {loading ? (
                        <p className="staff-dashboard-panel__loading">טוען…</p>
                    ) : (
                        <>
                            <p className="staff-dashboard-panel__count">{pendingCount}</p>
                            {pendingRequests.length === 0 ? (
                                <DashboardPanelEmpty message="אין בקשות ממתינות" />
                            ) : (
                                <ul className="staff-dashboard-panel__list">
                                    {pendingRequests.map((request) => {
                                        const registrationDate = formatDate(
                                            request.registered_at
                                        );

                                        return (
                                            <li
                                                key={
                                                    request.registrationId ||
                                                    request.participant_id ||
                                                    request.id
                                                }
                                                className="staff-dashboard-panel__item staff-dashboard-panel__item--with-action"
                                            >
                                                <DashboardPanelRequestDetails
                                                    activityLabel={getRegistrationActivityLabel(
                                                        request
                                                    )}
                                                    participantName={
                                                        request.full_name
                                                    }
                                                    dateLabel={registrationDate}
                                                />
                                                <button
                                                    type="button"
                                                    className="staff-dashboard-panel__item-action"
                                                    onClick={() =>
                                                        onCompleteRegistration?.(
                                                            request
                                                        )
                                                    }
                                                >
                                                    השלמת רישום
                                                </button>
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

            <section className="staff-dashboard-panel staff-dashboard-panel--summary">
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
                            <DashboardPanelEmpty message="אין ביטולים חדשים" />
                        )
                    ) : (
                        <>
                            <p className="staff-dashboard-panel__count staff-dashboard-panel__count--compact">
                                {cancellationCount} ביטולים
                            </p>
                            <ul className="staff-dashboard-panel__list">
                                {recentCancellations.map((item) => {
                                    const cancellationDate = formatCancellationDate(
                                        item.cancellation.cancelled_at
                                    );
                                    const dateLabel =
                                        cancellationDate &&
                                        cancellationDate !== "—"
                                            ? cancellationDate
                                            : "";

                                    return (
                                        <li
                                            key={item.cancellation.id}
                                            className="staff-dashboard-panel__item staff-dashboard-panel__item--with-action"
                                        >
                                            <DashboardPanelRequestDetails
                                                activityLabel={getCancellationActivityLabel(
                                                    item
                                                )}
                                                participantName={
                                                    item.participantFullName
                                                }
                                                dateLabel={dateLabel}
                                            />
                                            <button
                                                type="button"
                                                className="staff-dashboard-panel__item-action"
                                                onClick={() =>
                                                    onManageCancellation?.(item)
                                                }
                                            >
                                                ניהול ביטול
                                            </button>
                                        </li>
                                    );
                                })}
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
            </div>

            <div className="staff-dashboard-panels__mobile">
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
                                        <ActivityDateDisplay
                                            startDate={activity.data?.start_date}
                                        />
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
        </div>
    );
}

export default DashboardControlPanels;
