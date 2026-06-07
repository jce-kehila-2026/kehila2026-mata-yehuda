import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");