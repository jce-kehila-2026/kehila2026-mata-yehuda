import { useState } from "react";
import { auth, db } from "../config/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import StaffDashboard from "./StaffDashboard";

function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setisLoggedIn] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let userCredential = await signInWithEmailAndPassword(auth, email, password);
      let user = userCredential.user;

      let staffRef = doc(db, "staff", user.uid);
      let staffSnap = await getDoc(staffRef);

      if (!staffSnap.exists()) {
        setError("המשתמש אינו איש צוות");
        await signOut(auth);
        return;
      }

      const staffData = staffSnap.data();

      if (!staffData.is_active) {
        setError("איש צוות זה אינו פעיל");
        await signOut(auth);
        return;
      }

      setisLoggedIn(true);
    }
    catch (error) {
      setError("Invalid email or password");
    }
    finally {
      setLoading(false);
    }

  }

  if (isLoggedIn) {
    return <StaffDashboard onLogout={() => {
      setisLoggedIn(false);
      setEmail("");
      setPassword("");
      setError("");
    }} />;
  }

  return (
    <div>
      <h1>כניסת צוות</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          {loading ? "מתחבר..." : "התחברות"}
        </button>

        {error && <p>{error}</p>}
      </form>
    </div>
  );

}
export default StaffLogin;


