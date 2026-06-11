import { useCallback, useEffect, useState } from "react";
import MessageForm from "../components/messages/forms/MessageForm";
import NotificationRecentActivity from "../components/messages/NotificationRecentActivity";
import NotificationStatsCards from "../components/messages/NotificationStatsCards";
import {
    formatNotificationSummary,
    NOTIFICATION_BACKEND_REQUIRED_MESSAGE,
    NOTIFICATION_COMPLIANCE_NOTE,
    validateNotificationMessage
} from "../components/messages/helpers/messageHelpers";
import { fetchNotificationDashboardData } from "../services/notificationDashboardService";
import { sendPushNotification } from "../services/notificationService";

function SendMessages() {
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

    async function handleSendNotification() {
        setError("");
        setSuccess("");

        const validationError = validateNotificationMessage({ title, body });

        if (validationError) {
            setError(validationError);
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
                setError("יש להתחבר מחדש כדי לשלוח התראות");
            } else if (err.message === NOTIFICATION_BACKEND_REQUIRED_MESSAGE) {
                setError(err.message);
            } else if (err.status === 503) {
                setError(
                    err.message ||
                        "שרת ההתראות לא מוגדר. הפעל את שרת השליחה והגדר משתני סביבה."
                );
            } else {
                setError(err.message || "שגיאה בשליחת ההתראה");
            }
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="staff-page staff-page--messages">
            <header className="notifications-page-header staff-header">
                <div className="notifications-page-header__inner">
                    <h1>שליחת התראות</h1>
                    <p>
                        שליחת הודעות push למשתתפים שנרשמו לקבלת עדכונים בדפדפן
                    </p>
                </div>
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
    );
}

export default SendMessages;
