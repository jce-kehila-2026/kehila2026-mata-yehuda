import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { auth } from "../../config/firebase";
import { verifyActiveStaffUser } from "../../utils/staffManegmentUtils/staffAuth";

function StaffAuthGate({ children }) {
  const location = useLocation();
  const verifyGenerationRef = useRef(0);
  const [accessState, setAccessState] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    let unsubscribeAuth = () => {};

    const handleAuthUser = (user) => {
      if (cancelled) {
        return;
      }

      const generation = ++verifyGenerationRef.current;

      if (!user) {
        setAccessState("denied");
        return;
      }

      setAccessState("loading");

      (async () => {
        try {
          const result = await verifyActiveStaffUser(user);

          if (cancelled || generation !== verifyGenerationRef.current) {
            return;
          }

          if (auth.currentUser?.uid !== user.uid) {
            setAccessState("denied");
            return;
          }

          if (!result.ok) {
            await signOut(auth);

            if (cancelled || generation !== verifyGenerationRef.current) {
              return;
            }

            setAccessState("denied");
            return;
          }

          setAccessState("allowed");
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

          setAccessState("denied");
        }
      })();
    };

    auth
      .authStateReady()
      .then(() => {
        if (cancelled) {
          return;
        }

        if (!auth.currentUser) {
          setAccessState("denied");
        }

        unsubscribeAuth = onAuthStateChanged(auth, handleAuthUser);
      })
      .catch((error) => {
        console.error("Staff auth initialization failed:", error);

        if (!cancelled) {
          setAccessState("denied");
        }
      });

    return () => {
      cancelled = true;
      verifyGenerationRef.current += 1;
      unsubscribeAuth();
    };
  }, []);

  if (accessState === "denied") {
    return (
      <Navigate
        to="/staff-login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (accessState !== "allowed") {
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

  return children ?? <Outlet />;
}

export function withStaffAuthGate(Component) {
  function ProtectedStaffRoute() {
    return (
      <StaffAuthGate>
        <Component />
      </StaffAuthGate>
    );
  }

  ProtectedStaffRoute.displayName = `ProtectedStaffRoute(${
    Component.displayName || Component.name || "Component"
  })`;

  return ProtectedStaffRoute;
}

export function protectStaffRoute(element) {
  return <StaffAuthGate>{element}</StaffAuthGate>;
}

export default StaffAuthGate;
