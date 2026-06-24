import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CircleUserRound,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail
} from "lucide-react";
import {
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { verifyActiveStaffUser } from "../../utils/staffManegmentUtils/staffAuth";

const PASSWORD_RESET_LOG_PREFIX = "[staff-login] sendPasswordResetEmail";

function getPasswordResetErrorMessage(error) {
    const code = error?.code ?? "";

    switch (code) {
        case "auth/invalid-email":
            return "כתובת האימייל אינה תקינה";
        case "auth/missing-email":
            return "יש להזין כתובת אימייל תחילה";
        case "auth/too-many-requests":
            return "בוצעו יותר מדי ניסיונות. נסו שוב מאוחר יותר";
        case "auth/network-request-failed":
            return "שגיאת רשת. בדקו את החיבור לאינטרנט ונסו שוב";
        case "auth/user-not-found":
            return "לא נמצא משתמש עם כתובת אימייל זו במערכת";
        default:
            return "לא ניתן לשלוח קישור לאיפוס סיסמה. אנא בדקו את כתובת האימייל";
    }
}

function StaffLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const unsubscribe = onAuthStateChanged(auth, () => {
            if (!cancelled) {
                setAuthReady(true);
            }
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    async function handleForgotPassword() {
        setError("");
        setResetSuccess("");

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError("יש להזין כתובת אימייל תחילה");
            return;
        }

        setResetLoading(true);

        console.log(`${PASSWORD_RESET_LOG_PREFIX}: start`, {
            email: trimmedEmail,
            projectId: auth.app?.options?.projectId,
            authDomain: auth.app?.options?.authDomain,
        });

        try {
            await sendPasswordResetEmail(auth, trimmedEmail);

            console.log(`${PASSWORD_RESET_LOG_PREFIX}: success`, {
                email: trimmedEmail,
            });

            setResetSuccess(
                `נשלח קישור לאיפוס סיסמה לכתובת ${trimmedEmail}. אם לא התקבל תוך מספר דקות, בדקו בתיקיית דואר זבל וודאו שהאימייל רשום במערכת.`
            );
        } catch (resetError) {
            console.error(`${PASSWORD_RESET_LOG_PREFIX}: failed`, {
                email: trimmedEmail,
                code: resetError?.code,
                message: resetError?.message,
            });
            setError(getPasswordResetErrorMessage(resetError));
        } finally {
            setResetLoading(false);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setResetSuccess("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            const result = await verifyActiveStaffUser(user);

            if (!result.ok) {
                if (result.reason === "not_staff") {
                    setError("המשתמש אינו איש צוות");
                } else if (result.reason === "inactive") {
                    setError("איש צוות זה אינו פעיל");
                } else {
                    setError("אין הרשאת גישה לצוות");
                }

                await signOut(auth);
                return;
            }

            navigate("/staff/area-selection", { replace: true });
        } catch {
            setError("האימייל או הסיסמה שגויים");
        } finally {
            setLoading(false);
        }
    }

    if (!authReady) {
        return (
            <div className="staff-login-page" dir="rtl">
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

    const hasError = Boolean(error);
    const formMessageId = error
        ? "staff-login-error"
        : resetSuccess
          ? "staff-login-reset-success"
          : undefined;

    return (
        <div className="staff-login-page">
            <div className="staff-login-card">
                <header className="staff-login-header">
                    <p className="staff-login-header__brand">
                        {["קהילה מטה ", "יהודה"].join("")}
                    </p>
                    <h1 className="staff-login-header__title">כניסת צוות</h1>
                    <p className="staff-login-header__subtitle">
                        התחברות למערכת ניהול הקהילה
                    </p>
                </header>

                <div className="staff-login-body">
                    <div className="staff-login-icon-wrap" aria-hidden="true">
                        <CircleUserRound
                            className="staff-login-icon"
                            strokeWidth={1.75}
                        />
                    </div>

                    <form
                        className="staff-login-form staff-form"
                        onSubmit={handleLogin}
                        aria-label="טופס כניסת צוות"
                        noValidate
                    >
                        <label htmlFor="staff-login-email">אימייל</label>
                        <div
                            className={`staff-login-field${
                                hasError ? " staff-login-field--error" : ""
                            }`}
                        >
                            <span
                                className="staff-login-field__leading"
                                aria-hidden="true"
                            >
                                <Mail strokeWidth={2} />
                            </span>
                            <input
                                id="staff-login-email"
                                type="email"
                                placeholder="אימייל"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                disabled={loading || resetLoading}
                                aria-label="אימייל"
                                aria-invalid={hasError}
                                aria-describedby={formMessageId}
                            />
                        </div>

                        <label htmlFor="staff-login-password">סיסמה</label>
                        <div
                            className={`staff-login-field staff-login-field--password${
                                hasError ? " staff-login-field--error" : ""
                            }`}
                        >
                            <span
                                className="staff-login-field__leading"
                                aria-hidden="true"
                            >
                                <Lock strokeWidth={2} />
                            </span>
                            <input
                                id="staff-login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="סיסמה"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="current-password"
                                disabled={loading || resetLoading}
                                aria-label="סיסמה"
                                aria-invalid={hasError}
                                aria-describedby={formMessageId}
                            />
                            <button
                                type="button"
                                className="staff-login-field__toggle"
                                onClick={() =>
                                    setShowPassword((current) => !current)
                                }
                                aria-label={
                                    showPassword ? "הסתר סיסמה" : "הצג סיסמה"
                                }
                                disabled={loading || resetLoading}
                            >
                                {showPassword ? (
                                    <EyeOff strokeWidth={2} aria-hidden="true" />
                                ) : (
                                    <Eye strokeWidth={2} aria-hidden="true" />
                                )}
                            </button>
                        </div>

                        <button
                            type="button"
                            className="staff-login-forgot-password"
                            onClick={handleForgotPassword}
                            disabled={loading || resetLoading}
                            aria-busy={resetLoading}
                        >
                            {resetLoading ? "שולח..." : "שכחת סיסמה?"}
                        </button>

                        {error ? (
                            <div
                                id="staff-login-error"
                                className="staff-alert staff-alert--error staff-login-form__alert"
                                role="alert"
                                aria-live="polite"
                            >
                                {error}
                            </div>
                        ) : null}

                        {resetSuccess ? (
                            <div
                                id="staff-login-reset-success"
                                className="staff-alert staff-alert--success staff-login-form__alert"
                                role="status"
                                aria-live="polite"
                            >
                                {resetSuccess}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            className="staff-button staff-login-submit"
                            disabled={loading || resetLoading}
                            aria-busy={loading}
                            aria-label={loading ? "מתחבר" : "התחברות"}
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        className="staff-login-submit__spinner"
                                        strokeWidth={2.25}
                                        aria-hidden="true"
                                    />
                                    <span>מתחבר...</span>
                                </>
                            ) : (
                                "התחברות"
                            )}
                        </button>

                        <p className="staff-login-footer">
                            {["מערכת ניהול קהילה - מטה ", "יהודה"].join("")}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StaffLogin;
