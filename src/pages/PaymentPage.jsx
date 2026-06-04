import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentForm from "../components/PaymentForm";
import { apiGet } from "../services/api";
import { formatDisplayPrice } from "../services/formatPrice";
import { buildActivityPaymentPath } from "../services/paymentLink";
import { notifyRegistrationBlock } from "../services/registrationErrors";

function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get("activityId");
  const programId = searchParams.get("programId") || "";

  const [loading, setLoading] = useState(Boolean(activityId));
  const [loadError, setLoadError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [showCancelLookup, setShowCancelLookup] = useState(false);

  const [activitiesLoading, setActivitiesLoading] = useState(!activityId);
  const [activitiesError, setActivitiesError] = useState("");
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (activityId) {
      return;
    }

    let cancelled = false;

    async function loadActivities() {
      setActivitiesLoading(true);
      setActivitiesError("");
      setActivities([]);

      try {
        const { response, data } = await apiGet("/activities");

        if (cancelled) {
          return;
        }

        if (!response.ok || !data.success) {
          setActivitiesError(data.message || "לא ניתן לטעון פעילויות");
          return;
        }

        setActivities(Array.isArray(data.activities) ? data.activities : []);
      } catch (error) {
        if (!cancelled) {
          setActivitiesError(error.message || "שגיאה בטעינת פעילויות");
        }
      } finally {
        if (!cancelled) {
          setActivitiesLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, [activityId]);

  useEffect(() => {
    if (!activityId) {
      setPaymentInfo(null);
      setLoadError("");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadActivity() {
      setLoading(true);
      setLoadError("");
      setPaymentInfo(null);

      try {
        const { response, data } = await apiGet(
          `/activities/${encodeURIComponent(activityId)}/payment-info`
        );

        if (cancelled) {
          return;
        }

        if (!response.ok || !data.success) {
          setLoadError(data.message || "לא ניתן לטעון את פרטי הפעילות");
          return;
        }

        setPaymentInfo({
          activityId: data.activityId,
          title: data.title,
          price: data.price,
          currency: data.currency,
          description: data.description || "",
        });
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "שגיאה בטעינת הפעילות");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [activityId]);

  useEffect(() => {
    if (loadError) {
      notifyRegistrationBlock(loadError);
    }
  }, [loadError]);

  const startRegistration = (id) => {
    setShowCancelLookup(false);
    navigate(buildActivityPaymentPath(id, { programId }));
  };

  const openActivities = activities.filter((a) => a.openForRegistration);
  const heroTitle =
    showCancelLookup && !paymentInfo ? "ביטול הרשמה" : "הרשמה לפעילות";

  return (
    <>
      <header className="community-hero">
        <span className="hero-icon" aria-hidden="true">
          {showCancelLookup && !paymentInfo ? "🔍" : "📋"}
        </span>
        <h1>{heroTitle}</h1>
        {!showCancelLookup && (
          <>
            <p>
              {activityId
                ? "נרשמתם כבר? ניתן לבטל הרשמה קיימת."
                : "אין קישור? בחרו פעילות מהרשימה או בטלו הרשמה לפי ת.ז."}
            </p>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => setShowCancelLookup(true)}
            >
              ביטול הרשמה קיימת
            </button>
          </>
        )}
      </header>

      {!activityId && !showCancelLookup && (
        <section
          className="community-section"
          aria-labelledby="activity-picker-title"
        >
          <h2 id="activity-picker-title">בחרו פעילות להרשמה</h2>

          {activitiesLoading && <p className="section-description">טוען פעילויות...</p>}

          {activitiesError && (
            <p className="form-error" role="alert">
              {activitiesError}
            </p>
          )}

          {!activitiesLoading && !activitiesError && openActivities.length > 0 && (
            <ul className="services-grid">
              {openActivities.map((activity) => (
                <li key={activity.activityId} className="service-card">
                  <h3>{activity.title}</h3>
                  {activity.description && <p>{activity.description}</p>}
                  <p>
                    <strong>
                      {formatDisplayPrice(activity.price, activity.currency)}
                    </strong>
                  </p>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => startRegistration(activity.activityId)}
                  >
                    הרשמה ותשלום
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!activitiesLoading &&
            !activitiesError &&
            activities.length > 0 &&
            openActivities.length === 0 && (
              <p className="form-error" role="alert">
                אין פעילויות פתוחות להרשמה כרגע. ייתכן שההרשמה עדיין לא נפתחה, שהמועד
                הסתיים, או שאין מקומות פנויים.
              </p>
            )}

          {!activitiesLoading && !activitiesError && activities.length === 0 && (
            <p className="form-error" role="alert">
              לא נמצאו פעילויות עם מחיר. הוסיפו מסמך ב-Firestore תחת{" "}
              <code dir="ltr">activities</code> עם שדות title ו-price.
            </p>
          )}
        </section>
      )}

      {(loading || loadError) && (
        <section className="community-section">
          {loading && <p className="section-description">טוען פרטי פעילות...</p>}
          {loadError && (
            <p className="form-error" role="alert">
              {loadError}
            </p>
          )}
        </section>
      )}

      {paymentInfo && !showCancelLookup && (
        <section className="payment-info" aria-label="פרטי פעילות">
          <h2>פרטי הפעילות</h2>
          <p>
            <strong>{paymentInfo.title}</strong>
          </p>
          {paymentInfo.description && <p>{paymentInfo.description}</p>}
          <p>
            <strong>
              לתשלום:{" "}
              {formatDisplayPrice(paymentInfo.price, paymentInfo.currency)}
            </strong>
          </p>
          <div className="community-actions community-actions--inline">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/")}
            >
              בחירת פעילות אחרת
            </button>
          </div>
        </section>
      )}

      {(paymentInfo || showCancelLookup) && (
        <PaymentForm
          activityId={activityId || ""}
          programId={programId}
          paymentInfo={paymentInfo}
          registrationOnly={!paymentInfo}
          showLookupScreen={showCancelLookup}
          onLookupScreenChange={setShowCancelLookup}
        />
      )}
    </>
  );
}

export default PaymentPage;
