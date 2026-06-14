import { useEffect, useState } from "react";
import { isVapidKeyConfigured } from "../../config/fcmEnvironment";
import { useFcmTokenRegistrationContext } from "./FcmTokenRegistrationProvider";

function FcmDebugPanel() {
    const {
        permission,
        token,
        generationStatus,
        serviceWorkerRegistered,
        lastFailure
    } = useFcmTokenRegistrationContext();
    const [localStorageTokenExists, setLocalStorageTokenExists] = useState(false);

    useEffect(() => {
        setLocalStorageTokenExists(Boolean(localStorage.getItem("fcm_token")));
    }, [token, generationStatus]);

    if (!import.meta.env.DEV) {
        return null;
    }

    return (
        <aside
            dir="ltr"
            aria-label="FCM debug panel"
            style={{
                position: "fixed",
                bottom: "12px",
                left: "12px",
                zIndex: 9999,
                maxWidth: "320px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(20, 20, 20, 0.92)",
                color: "#f5f5f5",
                fontFamily: "monospace",
                fontSize: "12px",
                lineHeight: 1.5,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
            }}
        >
            <strong>[fcm debug]</strong>
            <div>Notification.permission: {permission}</div>
            <div>VAPID key exists: {String(isVapidKeyConfigured())}</div>
            <div>
                Service worker registered:{" "}
                {serviceWorkerRegistered === null
                    ? "checking..."
                    : String(serviceWorkerRegistered)}
            </div>
            <div>Token exists in localStorage: {String(localStorageTokenExists)}</div>
            <div>FCM token generation status: {generationStatus}</div>
            {lastFailure ? (
                <div style={{ marginTop: "8px", color: "#ffb4b4" }}>
                    {lastFailure.code}: {lastFailure.explanation}
                </div>
            ) : null}
        </aside>
    );
}

export default FcmDebugPanel;
