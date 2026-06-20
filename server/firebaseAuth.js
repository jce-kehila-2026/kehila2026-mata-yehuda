import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let initialized = false;

function resolveGoogleApplicationCredentialsPath() {
    const configured = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
    const candidates = [];

    if (configured) {
        candidates.push(path.resolve(process.cwd(), configured));
        candidates.push(path.resolve(__dirname, configured));
        candidates.push(
            path.resolve(__dirname, configured.replace(/^\.\//, ""))
        );
    }

    candidates.push(path.resolve(__dirname, "serviceAccountKey.json"));

    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                return candidate;
            }
        } catch {
            // ignore invalid paths
        }
    }

    return null;
}

function isFirebaseCloudRuntime() {
    return Boolean(
        process.env.K_SERVICE ||
            process.env.FUNCTION_TARGET ||
            process.env.FIREBASE_CONFIG
    );
}

function normalizeFirebasePrivateKey(raw) {
    if (!raw) {
        return null;
    }

    let key = String(raw).trim();
    if (
        (key.startsWith('"') && key.endsWith('"')) ||
        (key.startsWith("'") && key.endsWith("'"))
    ) {
        key = key.slice(1, -1).trim();
    }

    key = key.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");

    const begin = "-----BEGIN PRIVATE KEY-----";
    const end = "-----END PRIVATE KEY-----";

    if (!key.includes(begin) || !key.includes(end)) {
        return key;
    }

    const startIdx = key.indexOf(begin);
    const endIdx = key.indexOf(end) + end.length;
    key = key.slice(startIdx, endIdx);

    const body = key.replace(begin, "").replace(end, "").replace(/\s/g, "");
    if (!body) {
        return key;
    }

    const wrapped = body.match(/.{1,64}/g)?.join("\n") || body;
    return `${begin}\n${wrapped}\n${end}\n`;
}

function parseServiceAccountJson(raw) {
    let json = String(raw).trim();
    if (
        (json.startsWith('"') && json.endsWith('"')) ||
        (json.startsWith("'") && json.endsWith("'"))
    ) {
        json = json.slice(1, -1).trim();
    }

    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing client_email or private_key");
    }

    return {
        projectId: parsed.project_id?.trim() || "",
        clientEmail: parsed.client_email.trim(),
        privateKey: normalizeFirebasePrivateKey(parsed.private_key)
    };
}

function initializeFirebaseWithCert({ projectId, clientEmail, privateKey }) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: normalizeFirebasePrivateKey(privateKey)
        })
    });
}

export function initializeFirebaseAdmin() {
    if (initialized) {
        return;
    }

    if (admin.apps.length) {
        initialized = true;
        return;
    }

    const projectId =
        process.env.FIREBASE_PROJECT_ID?.trim() || "matayehuda";

    if (isFirebaseCloudRuntime()) {
        admin.initializeApp({ projectId: projectId || undefined });
        initialized = true;
        console.log("[firebaseAuth] Initialized Firebase Admin (cloud runtime)");
        return;
    }

    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    const credentialsPath = resolveGoogleApplicationCredentialsPath();

    if (credentialsPath) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId
        });
        initialized = true;
        console.log("[firebaseAuth] Initialized Firebase Admin via GOOGLE_APPLICATION_CREDENTIALS");
        return;
    }

    if (serviceAccountJson) {
        const creds = parseServiceAccountJson(serviceAccountJson);
        initializeFirebaseWithCert({
            projectId: creds.projectId || projectId,
            clientEmail: creds.clientEmail,
            privateKey: creds.privateKey
        });
        initialized = true;
        console.log("[firebaseAuth] Initialized Firebase Admin via FIREBASE_SERVICE_ACCOUNT_JSON");
        return;
    }

    if (clientEmail && privateKeyRaw) {
        initializeFirebaseWithCert({
            projectId,
            clientEmail,
            privateKey: privateKeyRaw
        });
        initialized = true;
        console.log("[firebaseAuth] Initialized Firebase Admin via FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY");
        return;
    }

    throw new Error("FIREBASE_ADMIN_NOT_CONFIGURED");
}

export async function verifyStaffIdToken(authorizationHeader) {
    initializeFirebaseAdmin();

    if (!authorizationHeader?.startsWith("Bearer ")) {
        console.warn("[firebaseAuth] verifyStaffIdToken: missing Authorization header");
        throw new Error("MISSING_AUTH_TOKEN");
    }

    const idToken = authorizationHeader.slice("Bearer ".length).trim();

    if (!idToken) {
        console.warn("[firebaseAuth] verifyStaffIdToken: empty Bearer token");
        throw new Error("MISSING_AUTH_TOKEN");
    }

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        console.log("[firebaseAuth] verifyStaffIdToken: token verified", {
            uid: decoded.uid,
            email: decoded.email || "(none)"
        });
        return decoded;
    } catch (error) {
        console.warn("[firebaseAuth] verifyStaffIdToken: invalid Firebase token", {
            message: error.message
        });
        throw new Error("INVALID_AUTH_TOKEN");
    }
}

/**
 * Verifies Firebase ID token and active staff document in Firestore.
 */
export async function verifyActiveStaffUser(authorizationHeader) {
    const decoded = await verifyStaffIdToken(authorizationHeader);
    const staffRef = admin.firestore().collection("staff").doc(decoded.uid);
    const staffSnap = await staffRef.get();

    if (!staffSnap.exists) {
        console.warn("[firebaseAuth] verifyActiveStaffUser: no staff document", {
            uid: decoded.uid,
            path: `staff/${decoded.uid}`
        });
        throw new Error("STAFF_NOT_FOUND");
    }

    const staffData = staffSnap.data();
    if (staffData?.is_active !== true) {
        console.warn("[firebaseAuth] verifyActiveStaffUser: staff document inactive", {
            uid: decoded.uid,
            is_active: staffData?.is_active ?? "(missing field)"
        });
        throw new Error("STAFF_INACTIVE");
    }

    console.log("[firebaseAuth] verifyActiveStaffUser: active staff verified", {
        uid: decoded.uid,
        email: decoded.email || staffData?.email || ""
    });

    return {
        uid: decoded.uid,
        email: decoded.email || staffData?.email || "",
        staff: staffData
    };
}

export function getAdminFirestore() {
    initializeFirebaseAdmin();
    return admin.firestore();
}

export function getAdminMessaging() {
    initializeFirebaseAdmin();
    return admin.messaging();
}
