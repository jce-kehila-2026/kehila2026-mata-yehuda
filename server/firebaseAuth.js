import admin from "firebase-admin";

let initialized = false;

function initializeFirebaseAdmin() {
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
