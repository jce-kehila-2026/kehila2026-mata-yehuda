import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXSKuacUxiGkEraG772OCAivOdoftCE6I",
  authDomain: "matayehuda.firebaseapp.com",
  projectId: "matayehuda",
  storageBucket: "matayehuda.firebasestorage.app",
  messagingSenderId: "264845791661",
  appId: "1:264845791661:web:bac32332d00b6323671124",
  measurementId: "G-81XHVPCSNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore database
export const db = getFirestore(app);