import { useLocation } from "react-router-dom";
import { FcmTokenRegistrationProvider } from "./FcmTokenRegistrationProvider";
import NotificationOptIn from "./NotificationOptIn";

const EXCLUDED_PATH_PREFIXES = [
    "/staff-login",
    "/community-staff",
    "/attendance",
    "/fcm-test"
];

function isPublicParticipantPath(pathname) {
    return !EXCLUDED_PATH_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

function PublicNotificationRegistration() {
    const { pathname } = useLocation();
    const isPublicPath = isPublicParticipantPath(pathname);

    if (!isPublicPath) {
        console.info("[fcm] registration skipped on non-public path", { pathname });
        return null;
    }

    console.info("[fcm] registration active on public path", { pathname });

    return (
        <FcmTokenRegistrationProvider>
            <NotificationOptIn />
        </FcmTokenRegistrationProvider>
    );
}

export default PublicNotificationRegistration;
