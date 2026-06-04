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
    <div className="staff-login-page">
      <div className="staff-login-card">
        <header className="staff-login-header">
          <h1 className="staff-login-header__title">כניסת צוות</h1>
          <p className="staff-login-header__subtitle">
            התחברות למערכת ניהול הקהילה
          </p>
        </header>

        <div className="staff-login-body">
          <span className="staff-login-icon" aria-hidden="true">
            👤
          </span>

          <form className="staff-login-form staff-form" onSubmit={handleLogin}>
            <label htmlFor="staff-login-email">אימייל</label>
            <input
              id="staff-login-email"
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label htmlFor="staff-login-password">סיסמה</label>
            <input
              id="staff-login-password"
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && <p className="staff-alert staff-alert--error">{error}</p>}

            <button type="submit" className="staff-button staff-login-submit">
              {loading ? "מתחבר..." : "התחברות"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

}
export default StaffLogin;
