import NotificationOptIn from "../components/notifications/NotificationOptIn";

/**
 * Wraps public participant-facing pages with notification opt-in.
 * Do not use on staff login, dashboard, or admin routes.
 */
function PublicParticipantLayout({ children }) {
    return (
        <>
            <NotificationOptIn />
            {children}
        </>
    );
}

export default PublicParticipantLayout;
