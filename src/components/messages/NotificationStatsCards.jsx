import { Bell, BellRing, Send } from "lucide-react";

const STAT_ITEMS = [
    {
        id: "registered",
        label: "משתתפים רשומים להתראות",
        icon: BellRing,
        key: "registeredParticipants"
    },
    {
        id: "devices",
        label: "מכשירים פעילים",
        icon: Bell,
        key: "activeDevices"
    },
    {
        id: "weekly",
        label: "התראות שנשלחו השבוע",
        icon: Send,
        key: "sentThisWeek"
    }
];

function NotificationStatsCards({ stats, loading }) {
    return (
        <section
            className="notifications-stats"
            aria-label="סטטיסטיקות התראות"
        >
            <div className="notifications-stats__grid">
                {STAT_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const value = loading ? "…" : (stats?.[item.key] ?? 0);

                    return (
                        <article
                            key={item.id}
                            className="notifications-stats__card"
                        >
                            <span
                                className="notifications-stats__icon-wrap"
                                aria-hidden="true"
                            >
                                <Icon
                                    className="notifications-stats__icon"
                                    strokeWidth={2}
                                />
                            </span>
                            <div className="notifications-stats__content">
                                <span className="notifications-stats__value">
                                    {value}
                                </span>
                                <span className="notifications-stats__label">
                                    {item.label}
                                </span>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default NotificationStatsCards;
