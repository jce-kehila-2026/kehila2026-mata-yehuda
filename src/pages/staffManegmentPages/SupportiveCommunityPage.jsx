import { useNavigate } from "react-router-dom";
import PublicParticipantLayout from "../layouts/PublicParticipantLayout";
import "../styles/SupportiveCommunityPage.css";

const FIXED_SERVICES = [
  {
    title: "מוקד מצוקה רפואי",
    text: "חיבור למוקד מצוקה רפואי הנותן מענה במקרי חירום, כולל התייעצות עם רופא, ביקור רופא בבית או הזמנת אמבולנס.",
  },
  {
    title: "אב קהילה",
    text: "אב הקהילה שומר על קשר אישי וקבוע עם חברי הקהילה, זמין טלפונית, מבקר בבתים, מסייע בפתרון בעיות ומקבל דיווחים ממוקד המצוקה.",
  },
  {
    title: "תיקונים קלים בבית",
    text: "סיוע בתיקונים בסיסיים בבית, כגון תיקוני רשתות, מנעולים, דלתות, אינסטלציה קלה והתקנת מעקי בטיחות.",
  },
  {
    title: "קישור לבעלי מקצוע",
    text: "במקרים שבהם נדרש תיקון מקצועי יותר, הקהילה מסייעת בחיבור לבעלי מקצוע אמינים.",
  },
  {
    title: "ביקורי בית ושיחה",
    text: "ביקורים בבית לצורך שיחה, הקשבה ושמירה על קשר רציף עם האזרחים הוותיקים ובני משפחותיהם.",
  },
  {
    title: "ייעוץ וסיוע בזכויות",
    text: "ייעוץ וסיוע בנושאים כמו חוק סיעוד, עובדים זרים וזכויות נוספות.",
  },
];

const VOLUNTEER_SERVICES = [
  "קניות",
  "רכישת תרופות",
  "ביקור חברתי",
  "שיחה והקשבה",
  "ליווי",
  "עזרה קלה בבית",
  "עזרה ברכישת ציוד נדרש",
  "קריאת ספרים",
  "משחקים ופעילות חברתית",
  "עזרה בטלפון או במחשב",
  "שירות נוסף לפי הצורך",
];

function SupportiveCommunityPage() {
  const navigate = useNavigate();

  return (
    <PublicParticipantLayout>
    <div className="supportive-community-page" dir="rtl">
      <header className="community-hero">
        <div className="hero-inner">
          <p className="hero-badge">עמותת ותיקי מטה יהודה</p>
          <h1>קהילה תומכת</h1>
          <p className="hero-lead">
            קהילה תומכת היא שירות המיועד לאזרחים ותיקים המעוניינים להמשיך
            להתגורר בביתם ובקהילתם, תוך קבלת תמיכה, ביטחון אישי וסיוע בתחומי
            חיים בסיסיים.
          </p>
        </div>
      </header>

      <main className="page-main">
        <section className="community-section" aria-labelledby="fixed-services-title">
          <div className="section-header">
            <span className="section-eyebrow">מה מקבלים</span>
            <h2 id="fixed-services-title">שירותים קבועים</h2>
            <p className="section-intro">
              שירותים שוטפים הכלולים בחברות בקהילה — זמינים לכל חבר וחברת
              הקהילה.
            </p>
          </div>

          <div className="services-grid">
            {FIXED_SERVICES.map((service, index) => (
              <article className="service-card" key={service.title}>
                <div className="service-card-top">
                  <span className="service-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3>{service.title}</h3>
                </div>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="community-section community-section--alt"
          aria-labelledby="volunteer-services-title"
        >
          <div className="section-header">
            <span className="section-eyebrow">בקשה לפי צורך</span>
            <h2 id="volunteer-services-title">שירותים נוספים באמצעות מתנדבים</h2>
            <p className="section-intro">
              בנוסף לשירותים הקבועים, ניתן להגיש בקשות לסיוע נוסף שבו מתנדבים
              יכולים לעזור.
            </p>
          </div>

          <ul className="volunteer-services-list">
            {VOLUNTEER_SERVICES.map((item) => (
              <li key={item}>
                <span className="list-marker" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="payment-info" aria-labelledby="payment-title">
          <div className="section-header">
            <span className="section-eyebrow">שקיפות</span>
            <h2 id="payment-title">תשלום והשתתפות עצמית</h2>
          </div>

          <div className="price-highlight">
            <span className="price-label">עלות חודשית רגילה</span>
            <span className="price-value">160 ₪</span>
          </div>

          <p>
            קיימות הנחות לזכאים, לדוגמה ניצולי שואה, מוכרי רווחה ובעלי חוק
            סיעוד.
          </p>

          <ul className="payment-details">
            <li>
              ביקור רופא בבית — <strong>25 ₪</strong>
            </li>
            <li>
              נסיעה באמבולנס — <strong>35 ₪</strong>
            </li>
            <li>
              בדיקת אמבולנס ללא פינוי — עד <strong>200 ₪</strong>
            </li>
          </ul>

          <p className="payment-note">
            ההצטרפות היא בקשה ראשונית בלבד. צוות העמותה יצור קשר להשלמת הפרטים,
            בדיקת זכאות והסדרת התשלום.
          </p>
        </section>

        <section className="community-actions" aria-label="פעולות">
          <p className="actions-title">מה תרצו לעשות?</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/community-join")}
          >
            בקשת הצטרפות לקהילה תומכת
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/community-service-request")}
          >
            חבר/ת קהילה? בקשת שירות נוסף
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/community-volunteer")}
          >
            התנדבות בקהילה תומכת
          </button>
        </section>
      </main>
    </div>
    </PublicParticipantLayout>
  );
}

export default SupportiveCommunityPage;
