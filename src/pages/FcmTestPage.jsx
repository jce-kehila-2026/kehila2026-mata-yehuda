import { useState } from "react";
import { getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getFirebaseEnvValues } from "../config/firebaseEnvironment";
import {
    FIREBASE_VAPID_CONSOLE_PATH,
    getConfiguredVapidKey,
    isVapidKeyConfigured
} from "../config/fcmEnvironment";

const LOG_PREFIX = "[fcm-test]";

function maskValue(value, visibleStart = 6, visibleEnd = 4) {
    const normalized = String(value || "").trim();

    if (!normalized) {
        return "(missing)";
    }

    if (normalized.length <= visibleStart + visibleEnd) {
        return `${normalized.slice(0, 2)}… (len ${normalized.length})`;
    }

    return `${normalized.slice(0, visibleStart)}…${normalized.slice(-visibleEnd)} (len ${normalized.length})`;
}

function is401Failure(error) {
    const haystack = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();

    return (
        haystack.includes("401") ||
        haystack.includes("unauthenticated") ||
        haystack.includes("token-subscribe-failed")
    );
}

function serializeError(error) {
    return {
        name: error?.name,
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause,
        raw: String(error)
    };
}

function logAwaitStart(label, details) {
    console.info(`${LOG_PREFIX} BEFORE ${label}`, details ?? {});
}

function logAwaitSuccess(label, details) {
    console.info(`${LOG_PREFIX} AFTER ${label}`, details ?? {});
}

function logAwaitFailure(label, error) {
    console.error(`${LOG_PREFIX} ERROR ${label}`, serializeError(error), error);
}

function failStep(steps, step, label, error) {
    logAwaitFailure(label, error);

    steps.push({
        step,
        ok: false,
        details: serializeError(error)
    });

    return {
        ok: false,
        steps,
        token: "",
        error: error?.code || error?.message || label,
        rawMessage: error?.message || String(error)
    };
}

async function readServiceWorkerSdkVersion() {
    const response = await fetch("/firebase-messaging-sw.js", { cache: "no-store" });
    const source = await response.text();
    const match = source.match(/firebasejs\/([^/]+)\/firebase-app-compat/);

    return {
        status: response.status,
        sdkVersion: match?.[1] || "unknown"
    };
}

async function runDirectGetTokenTest() {
    const steps = [];
    const env = getFirebaseEnvValues();
    const vapidKey = getConfiguredVapidKey();

    steps.push({
        step: "Firebase config",
        ok: Boolean(env.projectId && env.appId && env.messagingSenderId),
        details: {
            projectId: env.projectId,
            messagingSenderId: env.messagingSenderId,
            appId: env.appId,
            apiKey: maskValue(env.apiKey)
        }
    });

    if (!isVapidKeyConfigured()) {
        steps.push({
            step: "VAPID key",
            ok: false,
            details: "VITE_FIREBASE_VAPID_KEY is missing"
        });

        return { ok: false, steps, token: "", error: "VAPID_KEY_MISSING" };
    }

    steps.push({
        step: "VAPID key",
        ok: true,
        details: maskValue(vapidKey, 8, 6)
    });

    let supported;

    logAwaitStart("isSupported()");
    try {
        supported = await isSupported();
        logAwaitSuccess("isSupported()", { supported });
    } catch (error) {
        return failStep(steps, "isSupported()", "isSupported()", error);
    }

    steps.push({
        step: "Messaging supported",
        ok: supported,
        details: supported ? "yes" : "no"
    });

    if (!supported) {
        return { ok: false, steps, token: "", error: "MESSAGING_NOT_SUPPORTED" };
    }

    if (!("Notification" in window)) {
        steps.push({
            step: "Notification permission",
            ok: false,
            details: "Notification API unavailable"
        });

        return { ok: false, steps, token: "", error: "NOTIFICATION_API_UNSUPPORTED" };
    }

    let permission = Notification.permission;

    if (permission === "default") {
        logAwaitStart("Notification.requestPermission()", {
            currentPermission: permission
        });

        try {
            permission = await Notification.requestPermission();
            logAwaitSuccess("Notification.requestPermission()", { permission });
        } catch (error) {
            return failStep(
                steps,
                "Notification.requestPermission()",
                "Notification.requestPermission()",
                error
            );
        }
    } else {
        console.info(`${LOG_PREFIX} SKIP Notification.requestPermission()`, {
            currentPermission: permission
        });
    }

    steps.push({
        step: "Notification permission",
        ok: permission === "granted",
        details: permission
    });

    if (permission !== "granted") {
        return { ok: false, steps, token: "", error: "PERMISSION_NOT_GRANTED" };
    }

    if (!("serviceWorker" in navigator)) {
        steps.push({
            step: "Service worker",
            ok: false,
            details: "Service workers unsupported"
        });

        return { ok: false, steps, token: "", error: "SERVICE_WORKER_UNSUPPORTED" };
    }

    let registration;

    logAwaitStart("navigator.serviceWorker.register()", {
        scriptURL: "/firebase-messaging-sw.js"
    });

    try {
        registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );
        logAwaitSuccess("navigator.serviceWorker.register()", {
            scope: registration.scope,
            active: Boolean(registration.active),
            installing: Boolean(registration.installing),
            waiting: Boolean(registration.waiting)
        });
    } catch (error) {
        return failStep(
            steps,
            "navigator.serviceWorker.register()",
            "navigator.serviceWorker.register()",
            error
        );
    }

    let readyRegistration;

    logAwaitStart("navigator.serviceWorker.ready");
    try {
        readyRegistration = await navigator.serviceWorker.ready;
        logAwaitSuccess("navigator.serviceWorker.ready", {
            scope: readyRegistration.scope,
            scriptURL: readyRegistration.active?.scriptURL || null,
            active: Boolean(readyRegistration.active)
        });
    } catch (error) {
        return failStep(
            steps,
            "navigator.serviceWorker.ready",
            "navigator.serviceWorker.ready",
            error
        );
    }

    let swVersion;

    logAwaitStart("readServiceWorkerSdkVersion()");
    try {
        swVersion = await readServiceWorkerSdkVersion();
        logAwaitSuccess("readServiceWorkerSdkVersion()", swVersion);
    } catch (error) {
        return failStep(
            steps,
            "readServiceWorkerSdkVersion()",
            "readServiceWorkerSdkVersion()",
            error
        );
    }

    steps.push({
        step: "Service worker",
        ok: Boolean(readyRegistration.active),
        details: {
            scope: readyRegistration.scope,
            scriptURL:
                readyRegistration.active?.scriptURL || registration.active?.scriptURL,
            sdkVersion: swVersion.sdkVersion,
            httpStatus: swVersion.status
        }
    });

    let messaging;

    logAwaitStart("getMessaging(getApp())");
    try {
        messaging = getMessaging(getApp());
        logAwaitSuccess("getMessaging(getApp())", {
            messagingCreated: Boolean(messaging)
        });
    } catch (error) {
        return failStep(steps, "getMessaging(getApp())", "getMessaging(getApp())", error);
    }

    console.info(`${LOG_PREFIX} Calling getToken() directly`);

    let token;

    logAwaitStart("getToken()", {
        vapidKey: maskValue(vapidKey, 8, 6),
        serviceWorkerScope: readyRegistration.scope
    });

    try {
        token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: readyRegistration
        });
        logAwaitSuccess("getToken()", {
            tokenReceived: Boolean(token),
            tokenLength: token?.length || 0
        });
    } catch (error) {
        steps.push({
            step: "getToken()",
            ok: false,
            details: serializeError(error)
        });

        logAwaitFailure("getToken()", error);

        return {
            ok: false,
            steps,
            token: "",
            error: error?.code || "GET_TOKEN_FAILED",
            is401: is401Failure(error),
            rawMessage: error?.message || ""
        };
    }

    if (!token) {
        steps.push({
            step: "getToken()",
            ok: false,
            details: "Empty token returned"
        });

        return { ok: false, steps, token: "", error: "GET_TOKEN_EMPTY" };
    }

    console.info(`${LOG_PREFIX} Token generated`, { token });

    steps.push({
        step: "getToken()",
        ok: true,
        details: `${token.slice(0, 24)}… (len ${token.length})`
    });

    return { ok: true, steps, token, error: "" };
}

async function unregisterAllServiceWorkers() {
    if (!("serviceWorker" in navigator)) {
        return [];
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    const scopes = [];

    for (const registration of registrations) {
        scopes.push(registration.scope);
        await registration.unregister();
    }

    return scopes;
}

function clearSiteStorage() {
    localStorage.clear();
    sessionStorage.clear();
}

function FcmTestPage() {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [maintenanceMessage, setMaintenanceMessage] = useState("");

    async function handleRunTest() {
        setRunning(true);
        setMaintenanceMessage("");
        setResult(null);

        try {
            const testResult = await runDirectGetTokenTest();
            setResult(testResult);
        } catch (error) {
            setResult({
                ok: false,
                steps: [],
                token: "",
                error: error?.message || "UNEXPECTED_ERROR"
            });
        } finally {
            setRunning(false);
        }
    }

    async function handleCleanup() {
        setMaintenanceMessage("Cleaning up…");

        try {
            const unregistered = await unregisterAllServiceWorkers();
            clearSiteStorage();
            setMaintenanceMessage(
                unregistered.length
                    ? `Unregistered ${unregistered.length} service worker(s) and cleared storage. Hard-refresh the page before retesting.`
                    : "Cleared storage. No service workers were registered. Hard-refresh before retesting."
            );
        } catch (error) {
            setMaintenanceMessage(error?.message || "Cleanup failed");
        }
    }

    return (
        <main
            style={{
                maxWidth: "760px",
                margin: "2rem auto",
                padding: "1.5rem",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.5
            }}
            dir="ltr"
        >
            <h1 style={{ marginTop: 0 }}>FCM Direct Test</h1>
            <p>
                Isolated route that calls Firebase <code>getToken()</code> directly.
                No notification hooks or providers are used on this page.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button type="button" onClick={handleRunTest} disabled={running}>
                    {running ? "Running…" : "Run getToken() test"}
                </button>
                <button type="button" onClick={handleCleanup} disabled={running}>
                    Unregister SW + clear storage
                </button>
            </div>

            {maintenanceMessage ? (
                <p style={{ marginTop: "1rem", color: "#0f5132" }}>{maintenanceMessage}</p>
            ) : null}

            {result?.is401 ? (
                <section
                    style={{
                        marginTop: "1.5rem",
                        padding: "1rem",
                        border: "1px solid #f5c2c7",
                        borderRadius: "8px",
                        background: "#f8d7da"
                    }}
                >
                    <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>401 detected — rotate VAPID key</h2>
                    <ol style={{ marginBottom: 0, paddingLeft: "1.25rem" }}>
                        <li>
                            Firebase Console → Project Settings → Cloud Messaging → Web Push
                            certificates → generate a <strong>new</strong> key pair
                        </li>
                        <li>
                            Update <code>VITE_FIREBASE_VAPID_KEY</code> in <code>.env.local</code>
                        </li>
                        <li>Restart <code>npm run dev</code> (regenerates the service worker)</li>
                        <li>Click “Unregister SW + clear storage”, hard-refresh, and run the test again</li>
                    </ol>
                    <p style={{ marginBottom: 0 }}>
                        Console path: <code>{FIREBASE_VAPID_CONSOLE_PATH}</code>
                    </p>
                    {result.rawMessage ? (
                        <p style={{ marginBottom: 0 }}>
                            Raw error: <code>{result.rawMessage}</code>
                        </p>
                    ) : null}
                </section>
            ) : null}

            {result ? (
                <section style={{ marginTop: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.1rem" }}>
                        Result: {result.ok ? "SUCCESS" : "FAILED"}
                    </h2>

                    {result.token ? (
                        <p>
                            <strong>Token:</strong>{" "}
                            <code style={{ wordBreak: "break-all" }}>{result.token}</code>
                        </p>
                    ) : null}

                    {result.error ? (
                        <p>
                            <strong>Error:</strong> <code>{result.error}</code>
                        </p>
                    ) : null}

                    <ol style={{ paddingLeft: "1.25rem" }}>
                        {result.steps.map((entry) => (
                            <li key={entry.step} style={{ marginBottom: "0.75rem" }}>
                                <strong>
                                    {entry.ok ? "✅" : "❌"} {entry.step}
                                </strong>
                                <pre
                                    style={{
                                        margin: "0.35rem 0 0",
                                        padding: "0.75rem",
                                        background: "#f5f5f5",
                                        borderRadius: "6px",
                                        overflowX: "auto",
                                        whiteSpace: "pre-wrap"
                                    }}
                                >
                                    {typeof entry.details === "string"
                                        ? entry.details
                                        : JSON.stringify(entry.details, null, 2)}
                                </pre>
                            </li>
                        ))}
                    </ol>
                </section>
            ) : null}
        </main>
    );
}

export default FcmTestPage;
