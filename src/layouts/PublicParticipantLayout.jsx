/**
 * Wraps public participant-facing pages.
 * FCM registration and NotificationOptIn are handled globally by
 * PublicNotificationRegistration in App.jsx — do not duplicate providers here.
 */
function PublicParticipantLayout({ children }) {
    return children;
}

export default PublicParticipantLayout;
