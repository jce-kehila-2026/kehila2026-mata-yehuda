import { useNavigate } from "react-router-dom";
import "../styles/SupportiveCommunityPage.css";

function SupportiveCommunityPage() {
  const navigate = useNavigate();

  return (
    <div className="supportive-community-page" dir="rtl">
      <section className="community-hero">
        <h1>קהילה תומכת</h1>
        <p>
          קהילה תומכת היא שירות המיועד לאזרחים ותיקים המעוניינים להמשיך
          להתגורר בביתם ובקהילתם, תוך קבלת תמיכה, ביטחון אישי וסיוע בתחומי
          חיים בסיסיים.
        </p>
      </section>

      <section className="community-section">
        <h2>שירותים קבועים</h2>

        <div className="services-grid">
          <div className="service-card">
            <h3>מוקד מצוקה רפואי</h3>
            <p>
              חיבור למוקד מצוקה רפואי הנותן מענה במקרי חירום, כולל התייעצות
              עם רופא, ביקור רופא בבית או הזמנת אמבולנס.
            </p>
          </div>

          <div className="service-card">
            <h3>אב קהילה</h3>
            <p>
              אב הקהילה שומר על קשר אישי וקבוע עם חברי הקהילה, זמין טלפונית,
              מבקר בבתים, מסייע בפתרון בעיות ומקבל דיווחים ממוקד המצוקה.
            </p>
          </div>

          <div className="service-card">
            <h3>תיקונים קלים בבית</h3>
            <p>
              סיוע בתיקונים בסיסיים בבית, כגון תיקוני רשתות, מנעולים, דלתות,
              אינסטלציה קלה והתקנת מעקי בטיחות.
            </p>
          </div>

          <div className="service-card">
            <h3>קישור לבעלי מקצוע</h3>
            <p>
              במקרים שבהם נדרש תיקון מקצועי יותר, הקהילה מסייעת בחיבור לבעלי
              מקצוע אמינים.
            </p>
          </div>

          <div className="service-card">
            <h3>ביקורי בית ושיחה</h3>
            <p>
              ביקורים בבית לצורך שיחה, הקשבה ושמירה על קשר רציף עם האזרחים
              הוותיקים ובני משפחותיהם.
            </p>
          </div>

          <div className="service-card">
            <h3>ייעוץ וסיוע בזכויות</h3>
            <p>
              ייעוץ וסיוע בנושאים כמו חוק סיעוד, עובדים זרים וזכויות נוספות.
            </p>
          </div>
        </div>
      </section>

      <section className="community-section">
        <h2>שירותים נוספים באמצעות מתנדבים</h2>
        <p className="section-description">
          בנוסף לשירותים הקבועים, ניתן להגיש בקשות לסיוע נוסף שבו מתנדבים
          יכולים לעזור.
        </p>

        <ul className="volunteer-services-list">
              <li>קניות</li>
              <li>רכישת תרופות</li>
              <li>ביקור חברתי</li>
              <li>שיחה והקשבה</li>
              <li>ליווי</li>
              <li>עזרה קלה בבית</li>
              <li>עזרה ברכישת ציוד נדרש</li>
              <li>קריאת ספרים</li>
              <li>משחקים ופעילות חברתית</li>
              <li>עזרה בטלפון או במחשב</li>
              <li>שירות נוסף לפי הצורך</li>
        </ul>
</section> 
      <section className="payment-info">
        <h2>תשלום והשתתפות עצמית</h2>
        <p>
          עלות רגילה של חברות בקהילה תומכת היא <strong>160 ₪ לחודש</strong>.
          קיימות הנחות לזכאים, לדוגמה ניצולי שואה, מוכרי רווחה ובעלי חוק
          סיעוד.
        </p>
        <p>
          חלק מהשירותים כוללים השתתפות עצמית נוספת: ביקור רופא בבית —
          <strong> 25 ₪</strong>, ונסיעה באמבולנס — <strong>35 ₪</strong>.
          בנוסף, במקרה של בדיקת אמבולנס ללא פינוי ייתכן תשלום של כ-
          <strong>200 ₪</strong>.
        </p>
        <p>
          ההצטרפות היא בקשה ראשונית בלבד. צוות העמותה יצור קשר להשלמת
          הפרטים, בדיקת זכאות והסדרת התשלום.
        </p>
      </section>

      <section className="community-actions">
        <button onClick={() => navigate("/community-join")}>
          בקשת הצטרפות לקהילה תומכת
        </button>

        <button onClick={() => navigate("/community-service-request")}>
          חבר/ת קהילה? בקשת שירות נוסף
        </button>

        <button onClick={() => navigate("/community-volunteer")}>
          התנדבות בקהילה תומכת
        </button>
      </section>
    </div>
  );
}

export default SupportiveCommunityPage;

