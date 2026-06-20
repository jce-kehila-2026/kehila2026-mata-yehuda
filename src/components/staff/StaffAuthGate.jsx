import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { auth } from "../../config/firebase";
import { verifyActiveStaffUser } from "../../utils/staffManegmentUtils/staffAuth";

function StaffAuthGate({ children }) {
  const location = useLocation();
  const verifyGenerationRef = useRef(0);
  const [state, setState] = useState({
    authReady: false,
    allowed: false,
  });

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (cancelled) {
        return;
      }

      const generation = ++verifyGenerationRef.current;

      if (!user) {
        setState({ authReady: true, allowed: false });
        return;
      }

      setState({ authReady: false, allowed: false });

      (async () => {
        try {
          const result = await verifyActiveStaffUser(user);

          if (cancelled || generation !== verifyGenerationRef.current) {
            return;
          }

          if (auth.currentUser?.uid !== user.uid) {
            setState({ authReady: true, allowed: false });
            return;
          }

          if (!result.ok) {
            await signOut(auth);

            if (cancelled || generation !== verifyGenerationRef.current) {
              return;
            }

            setState({ authReady: true, allowed: false });
            return;
          }

          setState({ authReady: true, allowed: true });
        } catch (error) {
          console.error("Staff auth verification failed:", error);

          if (cancelled || generation !== verifyGenerationRef.current) {
            return;
          }

          try {
            await signOut(auth);
          } catch {
            // ignore sign-out errors
          }

          if (cancelled || generation !== verifyGenerationRef.current) {
            return;
          }

          setState({ authReady: true, allowed: false });
        }
      })();
    });

    return () => {
      cancelled = true;
      verifyGenerationRef.current += 1;
      unsubscribe();
    };
  }, []);

  if (!state.authReady) {
    return (
      <div className="staff-auth-gate" dir="rtl">
        <div className="staff-auth-gate__state" role="status">
          <Loader2
            className="staff-auth-gate__spinner"
            strokeWidth={2}
            aria-hidden="true"
          />
          <p>טוען…</p>
        </div>
      </div>
    );
  }

  if (!state.allowed) {
    return (
      <Navigate
        to="/staff-login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children ?? <Outlet />;
}

export default StaffAuthGate;
