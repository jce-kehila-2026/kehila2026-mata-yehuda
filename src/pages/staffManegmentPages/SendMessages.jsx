import { useCallback, useEffect, useState } from "react";
import MessageForm from "../../components/messages/forms/MessageForm";
import NotificationRecentActivity from "../../components/messages/NotificationRecentActivity";
import NotificationStatsCards from "../../components/messages/NotificationStatsCards";
import {
    formatNotificationSummary,
    getNotificationBackendRequiredMessage,
    NOTIFICATION_BACKEND_ERROR_NAME,
    NOTIFICATION_COMPLIANCE_NOTE,
    NOTIFICATION_NO_ACTIVE_DEVICES_MESSAGE,
    validateNotificationMessage
} from "../../components/messages/helpers/messageHelpers";
import { fetchNotificationDashboardData } from "../../services/staffManegmentServices/notificationDashboardService";
import {
    checkNotificationBackendHealth,
    sendPushNotification
} from "../../services/staffManegmentServices/notificationService";

function SendMessages({ onBack }) {
    const [title, setTitle] = useState("מטה יהודה");
    const [body, setBody] = useState("");
    const [targetGroup, setTargetGroup] = useState("all");
    const [sending, setSending] = useState(false);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadDashboardData = useCallback(async () => {
        setDashboardLoading(true);

        try {
            const data = await fetchNotificationDashboardData();
            setStats(data.stats);
            setRecentNotifications(data.recentNotifications);
        } catch (loadError) {
            console.error(loadError);
            setStats({
                registeredParticipants: 0,
                activeDevices: 0,
                sentThisWeek: 0
            });
            setRecentNotifications([]);
        } finally {
            setDashboardLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    useEffect(() => {
        let cancelled = false;

        checkNotificationBackendHealth().then((health) => {
            if (cancelled || health.ok) {
                return;
            }

            setError(
                getNotificationBackendRequiredMessage(health.apiBase || "")
            );
        });

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleSendNotification() {
        setError("");
        setSuccess("");

        const validationError = validateNotificationMessage({ title, body });

        if (validationError) {
            setError(validationError);
            return;
        }

        if (!dashboardLoading && (stats?.activeDevices ?? 0) === 0) {
            setError(NOTIFICATION_NO_ACTIVE_DEVICES_MESSAGE);
            return;
        }

        setSending(true);

        try {
            const result = await sendPushNotification({
                title,
                body,
                targetGroup
            });

            setSuccess(
                formatNotificationSummary({
                    successCount: result.successCount,
                    failureCount: result.failureCount,
                    totalTokens: result.totalTokens
                })
            );

            await loadDashboardData();
        } catch (err) {
            console.error(err);

            if (err.message === "NOT_AUTHENTICATED") {
                setError("יש להתחבר מחדש כדי לשלוח הודעות");
            } else if (err.name === NOTIFICATION_BACKEND_ERROR_NAME) {
                setError(err.message);
            } else if (err.status === 503) {
                setError(
                    err.message ||
                        "שרת ההודעות לא מוגדר. הפעל את שרת השליחה והגדר משתני סביבה."
                );
            } else {
                setError(err.message || "שגיאה בשליחת ההודעה");
            }
        } finally {
            setSending(false);
        }
    }

    return (
        <div
            className="staff-page staff-page--messages messages-mgmt-page"
            dir="rtl"
        >
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="messages-mgmt-decoration messages-mgmt-decoration--top"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="messages-mgmt-decoration messages-mgmt-decoration--left"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="messages-mgmt-decoration messages-mgmt-decoration--bottom"
            />

            <div className="staff-container staff-container--messages">
                <header className="messages-mgmt-page__header">
                    <div className="messages-mgmt-page__header-main">
                        <h1 className="messages-mgmt-page__title">
                            שליחת הודעות ועדכונים
                        </h1>
                        <p className="messages-mgmt-page__subtitle">
                            שליחת הודעות push למשתתפים שנרשמו לקבלת עדכונים בדפדפן
                        </p>
                    </div>
                    {onBack ? (
                        <div className="messages-mgmt-page__actions">
                            <button
                                type="button"
                                className="staff-back-button"
                                onClick={onBack}
                            >
                                <span
                                    className="staff-back-button__icon"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                                <span className="staff-back-button__label">
                                    חזרה ללוח הבקרה
                                </span>
                            </button>
                        </div>
                    ) : null}
                </header>

                <div className="notifications-page">
                <NotificationStatsCards stats={stats} loading={dashboardLoading} />

                <div className="notifications-page__layout">
                    <section className="notifications-page__form-section">
                        {error ? (
                            <div
                                className="notifications-alert notifications-alert--error"
                                role="alert"
                            >
                                {error}
                            </div>
                        ) : null}
                        {success ? (
                            <div
                                className="notifications-alert notifications-alert--success"
                                role="status"
                                style={{ whiteSpace: "pre-line" }}
                            >
                                {success}
                            </div>
                        ) : null}

                        <div className="notifications-card">
                            <MessageForm
                                title={title}
                                body={body}
                                targetGroup={targetGroup}
                                complianceNote={NOTIFICATION_COMPLIANCE_NOTE}
                                sending={sending}
                                onTitleChange={setTitle}
                                onBodyChange={setBody}
                                onTargetGroupChange={setTargetGroup}
                                onSubmit={handleSendNotification}
                            />
                        </div>
                    </section>

                    <NotificationRecentActivity
                        items={recentNotifications}
                        loading={dashboardLoading}
                    />
                </div>
                </div>
            </div>
        </div>
    );
}

export default SendMessages;
