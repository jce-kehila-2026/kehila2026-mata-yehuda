import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentForm from "../../components/Payment/PaymentForm";
import PaymentFailureScreen from "../../components/Payment/PaymentFailureScreen";
import { apiGet } from "../../services/Payment/api";
import { formatDisplayPrice } from "../../services/Payment/formatPrice";
import { buildActivityPaymentPath } from "../../services/Payment/paymentLink";
import { PAYMENT_ERROR_REASONS } from "../../services/Payment/paymentErrorMessages";

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
            <PaymentFailureScreen
              variant="inline"
              message={activitiesError}
              reason={PAYMENT_ERROR_REASONS.CONNECTION_ERROR}
              showRawMessage={false}
            />
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
              <PaymentFailureScreen
                variant="inline"
                message="אין פעילויות פתוחות להרשמה כרגע."
                reason={PAYMENT_ERROR_REASONS.REGISTRATION_NOT_OPEN}
                showRawMessage={false}
              />
            )}

          {!activitiesLoading && !activitiesError && activities.length === 0 && (
            <PaymentFailureScreen
              variant="inline"
              message="לא נמצאו פעילויות עם מחיר."
              reason={PAYMENT_ERROR_REASONS.ACTIVITY_NOT_FOUND}
              showRawMessage={false}
            />
          )}
        </section>
      )}

      {(loading || loadError) && (
        <section className="community-section">
          {loading && <p className="section-description">טוען פרטי פעילות...</p>}
          {loadError && (
            <PaymentFailureScreen
              variant="inline"
              message={loadError}
              showRawMessage={false}
            />
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
