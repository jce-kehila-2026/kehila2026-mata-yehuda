const LOG_PREFIX = "[firebase]";

const REQUIRED_ENV_KEYS = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
];

function readEnv(key) {
    return import.meta.env[key]?.trim() || "";
}

export function getFirebaseEnvValues() {
    return {
        apiKey: readEnv("VITE_FIREBASE_API_KEY"),
        authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN"),
        projectId: readEnv("VITE_FIREBASE_PROJECT_ID"),
        storageBucket:
            readEnv("VITE_FIREBASE_STORAGE_BUCKET") ||
            "matayehuda.firebasestorage.app",
        messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
        appId: readEnv("VITE_FIREBASE_APP_ID"),
        measurementId: readEnv("VITE_FIREBASE_MEASUREMENT_ID"),
    };
}

export function getMissingFirebaseEnvKeys() {
    return REQUIRED_ENV_KEYS.filter((key) => !readEnv(key));
}

function maskApiKey(apiKey) {
    if (!apiKey) {
        return "(missing)";
    }

    if (apiKey.length <= 8) {
        return "(set, length < 8 — likely invalid)";
    }

    return `${apiKey.slice(0, 6)}…${apiKey.slice(-4)} (length ${apiKey.length})`;
}

export function validateFirebaseEnvironmentAtStartup() {
    const values = getFirebaseEnvValues();
    const missing = getMissingFirebaseEnvKeys();

    console.info(`${LOG_PREFIX} Environment check`, {
        apiKey: maskApiKey(values.apiKey),
        projectId: values.projectId || "(missing)",
        authDomain: values.authDomain || "(missing)",
        appId: values.appId ? "(set)" : "(missing)",
        storageBucket: values.storageBucket,
        messagingSenderId: values.messagingSenderId || "(missing)",
    });

    if (missing.length === 0) {
        console.info(`${LOG_PREFIX} All required environment variables are set`);
        return { ok: true, missing: [], values };
    }

    console.error(
        `${LOG_PREFIX} Missing required environment variables:`,
        missing.join(", ")
    );
    console.error(
        `${LOG_PREFIX} Copy .env.example to .env.local and fill in Firebase Web app config from Firebase Console → Project Settings → Your apps → Web`
    );

    return { ok: false, missing, values };
}
