import admin from "firebase-admin";

let initialized = false;

export function initializeFirebaseAdmin() {
    if (initialized) {
        return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

    if (admin.apps.length) {
        initialized = true;
        return;
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: projectId || undefined
        });
    } else if (projectId) {
        admin.initializeApp({ projectId });
    } else {
        throw new Error("FIREBASE_ADMIN_NOT_CONFIGURED");
    }

    initialized = true;
}

export async function verifyStaffIdToken(authorizationHeader) {
    initializeFirebaseAdmin();

    if (!authorizationHeader?.startsWith("Bearer ")) {
        throw new Error("MISSING_AUTH_TOKEN");
    }

    const idToken = authorizationHeader.slice("Bearer ".length).trim();

    if (!idToken) {
        throw new Error("MISSING_AUTH_TOKEN");
    }

    return admin.auth().verifyIdToken(idToken);
}

/**
 * Verifies Firebase ID token and active staff document in Firestore.
 */
export async function verifyActiveStaffUser(authorizationHeader) {
    const decoded = await verifyStaffIdToken(authorizationHeader);
    const staffSnap = await admin
        .firestore()
        .collection("staff")
        .doc(decoded.uid)
        .get();

    if (!staffSnap.exists() || staffSnap.data()?.is_active !== true) {
        throw new Error("UNAUTHORIZED");
    }

    return {
        uid: decoded.uid,
        email: decoded.email || staffSnap.data()?.email || "",
        staff: staffSnap.data()
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
