import { formatCancellationDate } from "../cancellations/helpers/cancellationHelpers";
import { getRequestProgramLabel } from "../../services/staffManegmentServices/dashboardService";
import { formatInquiryDate } from "../../services/staffManegmentServices/inquiryService";
import { getStaffInquiriesRoute } from "../../config/staffInquiriesNavigation";
import DashboardActivityCalendar from "./DashboardActivityCalendar";

const PANEL_PREVIEW_LIMIT = 3;
const PENDING_REQUESTS_PREVIEW_LIMIT = 2;
const INQUIRIES_PREVIEW_LIMIT = 2;

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

    return (
        <div className="staff-dashboard-panels">
            <div className="staff-dashboard-panels__middle">
                <DashboardActivityCalendar
                    activities={dashboardActivities}
                    loading={loading}
                    onNavigate={onNavigate}
                    splitLayout
                />

                <section className="staff-dashboard-panel staff-dashboard-panel--summary staff-dashboard-panel--inquiries">
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
            </div>

            <div className="staff-dashboard-panels__bottom">
                <section className="staff-dashboard-panel staff-dashboard-panel--summary staff-dashboard-panel--pending">
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
                                            const programLabel =
                                                getRequestProgramLabel(request);

                                            return (
                                                <li
                                                    key={
                                                        request.registrationId ||
                                                        request.participant_id ||
                                                        request.id
                                                    }
                                                    className="staff-dashboard-panel__item staff-dashboard-panel__item--with-action"
                                                >
                                                    <div className="staff-dashboard-panel__item-content">
                                                        <span className="staff-dashboard-panel__item-name">
                                                            {request.full_name || "—"}
                                                        </span>
                                                        {programLabel ? (
                                                            <span className="staff-dashboard-panel__item-meta">
                                                                {programLabel}
                                                            </span>
                                                        ) : null}
                                                    </div>
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

                <section className="staff-dashboard-panel staff-dashboard-panel--summary staff-dashboard-panel--cancellations">
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
                                    {recentCancellations.map((item) => (
                                        <li
                                            key={item.cancellation.id}
                                            className="staff-dashboard-panel__item staff-dashboard-panel__item--with-action"
                                        >
                                            <div className="staff-dashboard-panel__item-content">
                                                <span className="staff-dashboard-panel__item-name">
                                                    {item.participantFullName || "—"}
                                                </span>
                                                <span className="staff-dashboard-panel__item-meta">
                                                    {formatCancellationDate(
                                                        item.cancellation.cancelled_at
                                                    )}
                                                </span>
                                            </div>
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
            </div>
        </div>
    );
}

export default DashboardControlPanels;
