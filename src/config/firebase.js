import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
export const STORAGE_BUCKET = "matayehuda.firebasestorage.app";

const firebaseConfig = {
  apiKey: "AIzaSyDXSKuacUxiGkEraG772OCAivOdoftCE6I",
  authDomain: "matayehuda.firebaseapp.com",
  projectId: "matayehuda",
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: "264845791661",
  appId: "1:264845791661:web:bac32332d00b6323671124",
  measurementId: "G-81XHVPCSNV",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app, `gs://${STORAGE_BUCKET}`);

