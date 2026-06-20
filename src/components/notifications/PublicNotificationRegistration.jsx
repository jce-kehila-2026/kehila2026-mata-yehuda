import { useLocation } from "react-router-dom";
import { FcmTokenRegistrationProvider } from "./FcmTokenRegistrationProvider";

const EXCLUDED_PATH_PREFIXES = ["/staff-login", "/community-staff", "/attendance"];

function isPublicParticipantPath(pathname) {
    return !EXCLUDED_PATH_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

function PublicNotificationRegistration({ children }) {
    const { pathname } = useLocation();
    const isPublicPath = isPublicParticipantPath(pathname);

    if (!isPublicPath) {
        return children;
    }

    return (
        <FcmTokenRegistrationProvider>{children}</FcmTokenRegistrationProvider>
    );
}

export default PublicNotificationRegistration;
