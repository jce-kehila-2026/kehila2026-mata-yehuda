import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFirebaseEnvValues } from "./firebaseEnvironment";

const env = getFirebaseEnvValues();

export const STORAGE_BUCKET = env.storageBucket;

const firebaseConfig = {
    apiKey: env.apiKey,
    authDomain: env.authDomain,
    projectId: env.projectId,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: env.messagingSenderId,
    appId: env.appId,
    ...(env.measurementId ? { measurementId: env.measurementId } : {}),
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app, `gs://${STORAGE_BUCKET}`);
