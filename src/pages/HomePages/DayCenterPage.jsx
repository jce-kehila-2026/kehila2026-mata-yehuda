import { useEffect, useState } from "react";
import DayCenterRegisterForm from "../../components/Homecomponents/DayCenterRegisterForm";
import { getProgramBYId } from "../../services/HomeServices/programService";

import "../../styles/HomeStyle/DayCenterPage.css";
import "../../styles/HomeStyle/Form.css";

const DAY_CENTER_IMAGES = {
  hero: "/images/daycenter3.png",
  gallery: [
    {
      src: "/images/daycenter1.png",
      alt: "פעילות מוזיקלית וחברתית במרכז יום",
      orientation: "portrait",
    },
    {
      src: "/images/daycenter2.png",
      alt: "חוג יצירה במרכז יום לותיק",
      orientation: "portrait",
    },
    {
      src: "/images/daycenter6.png",
      alt: "פעילות גינון וקהילה במרכז יום",
      orientation: "landscape",
    },
  ],
};

const GALLERY_IMAGES = DAY_CENTER_IMAGES.gallery;
const STATS = [
  {
    value: "148",
    label: "ותיקים",
    note: "נכון לחודש ינואר 2026",
  },
  {
    value: "37",
    label: "ישובים",
    note: "ברחבי המועצה",
  },
  {
    value: "15",
    label: "קווי הסעות",
    note: "מידי יום",
  },
];

const SECTIONS = [
  {
    id: "about",
    title: "מהו מרכז יום לותיק",
    content: (
      <p>
        מעבר לתוכנית הרישמית, זה עוגן של מקום קבוע, פנים מוכרות, נוחות ושלווה.
      </p>
    ),
  },
  {
    id: "participants",
    title: "מי מגיע למרכז",
    content: (
      <p>
        חלוצי הארץ, עולים ממדינות רבות, ניצולי שואה וותיקים מהמגזר הערבי.
      </p>
    ),
  },
  {
    id: "staff",
    title: "צוות המרכז",
    content: (
      <>
        <p>
          צוות המרכז הינו צוות רב תחומי מיומן ומוכשר המעניק טיפול, תשומת לב
          ואהבה לכל אחד ואחת מותיקי המרכז.
        </p>
        <p className="day-center-list-label">הצוות כולל:</p>
        <ul className="day-center-list day-center-list--compact">
          <li>מנהלת</li>
          <li>עובדת סוציאלית</li>
          <li>רכזת חברתית</li>
          <li>אחות</li>
          <li>מזכירה</li>
          <li>מנהלנית</li>
          <li>פיזיותרפיסטית</li>
          <li>מורים להתעמלות לגווניה השונים</li>
          <li>צוות חוגים נרחב במגוון תחומים</li>
          <li>מטפלים</li>
          <li>צוות מטבח</li>
          <li>צוות ניקיון</li>
        </ul>
        <ul className="day-center-list day-center-list--compact">
          <li>
            כמו כן, מועשר המרכז בצוות מתנדבים מסורים המשולבים בתחומים שונים
            ובסטודנטיות לעו&quot;ס.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "services",
    title: "שירותים בסיסיים",
    content: (
      <ul className="day-center-list day-center-list--compact">
        <li>הסעות – הוותיקים מגיעים למרכז וחוזרים ממנו בהסעות מאורגנות.</li>
        <li>הכוונה בניידות, הכוונה וסיוע בפעילויות השונות במרכז.</li>
        <li>ארוחת בוקר.</li>
        <li>קפה/תה בשעה 11:00.</li>
        <li>ארוחת צהריים.</li>
        <li>תפריט והרכב הארוחות מורכבים בפיקוח האחות.</li>
        <li>שירותי מניקור – פדיקור ומספרה ניתנים בתשלום סמלי.</li>
      </ul>
    ),
  },
  {
    id: "culture",
    title: "פעילות חברה ותרבות",
    content: (
      <ul className="day-center-list day-center-list--compact">
        <li>טיולים, הופעות וקונצרטים.</li>
        <li>
          טקסים וחגיגות לציון תאריכים מיוחדים: מסיבת ראש השנה, חנוכה, פורים,
          יום הזיכרון, ימי הולדת ועוד.
        </li>
        <li>אירועים בשיתוף בתי ספר, ארגונים בקהילה, משחקי חברה ושולחן.</li>
        <li>הרצאות, הצגות, מופעים ועוד שמגיעים אלינו פעם בחודש.</li>
      </ul>
    ),
  },
  {
    id: "activities",
    title: "חוגים ופעילויות",
    content: (
      <>
        <ul className="day-center-list day-center-list--compact">
          <li>
            במשך היום נערכים חוגים ופעילויות ע&quot;פ תוכנית מובנית שמותאמת לכל
            אחת ואחד.
          </li>
          <li>
            כל ותיק בוחר לעצמו במהלך היום את התעסוקה שבה ירצה להשתתף מתוך מגוון
            האפשרויות המוצע במרכז.
          </li>
          <li>כל יום מתקיימות קבוצות התעמלות.</li>
        </ul>
        <p className="day-center-list-label">חוגים ופעילויות:</p>
        <ul className="day-center-list day-center-list--compact day-center-list--columns">
          <li>קרמיקה</li>
          <li>גינון טיפולי</li>
          <li>מקהלה</li>
          <li>שירה בציבור</li>
          <li>תעסוקה ומלאכת יד</li>
          <li>הפעלה במוסיקה</li>
          <li>שירי פיוטים מן המקורות</li>
          <li>יוגה</li>
          <li>דרמה</li>
          <li>ועוד</li>
        </ul>
        <p className="day-center-list-label">הרצאות:</p>
        <ul className="day-center-list day-center-list--compact day-center-list--columns">
          <li>תנ&quot;ך ופרשת שבוע</li>
          <li>מורשת ישראל</li>
          <li>היסטוריה של מטה יהודה</li>
          <li>בריאות</li>
          <li>מיצוי זכויות</li>
          <li>העצמה</li>
          <li>מחשבים</li>
          <li>ועוד נושאים רבים ומגוונים</li>
        </ul>
      </>
    ),
  },
  {
    id: "funding",
    title: "דרכי מימון",
    content: (
      <>
        <p>ישנם כמה דרכים לממן את ההגעה למרכז היום:</p>
        <ul className="day-center-list day-center-list--compact">
          <li>תשלום פרטי.</li>
          <li>סיוע מהרווחה במקרים מסוימים.</li>
          <li>הדרך הנפוצה ביותר היא דרך שעות סיעוד של ביטוח לאומי.</li>
        </ul>
      </>
    ),
  },
  {
    id: "admission",
    title: "תהליך הקבלה",
    content: (
      <ul className="day-center-list day-center-list--compact">
        <li>יוצרים קשר עם העו&quot;ס של מרכז היום.</li>
        <li>מגיעים לוועדת קבלה.</li>
        <li>יוצאים לדרך.</li>
      </ul>
    ),
  },
];

function DayCenterPage() {
  const [showDayCenterForm, setShowDayCenterForm] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [loozUrl, setLoozUrl] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDayCenterImage() {
      const program = await getProgramBYId("day_center");
      const url = program?.["schedule_image_url"];

      if (!cancelled && typeof url === "string" && url.trim()) {
        setLoozUrl(url.trim());
      }
    }

    loadDayCenterImage();

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSection(sectionId) {
    setOpenSection((current) => (current === sectionId ? null : sectionId));
  }

  return (
    <div className="day-center-page" dir="rtl">
      <header className="day-center-hero" aria-label="מרכז יום לותיק מטה-יהודה">
        <div className="day-center-hero__shell">
          <div className="day-center-hero__banner">
            <img
              className="day-center-hero__image"
              src={DAY_CENTER_IMAGES.hero}
              alt="מרכז יום לותיק מטה-יהודה"
              width={1400}
              height={520}
              decoding="async"
            />
            <div className="day-center-hero__overlay">
              <div className="day-center-hero__panel">
                <div className="day-center-hero__content">
                  <h1 className="day-center-hero__title">מרכז יום – הבית השני שלי</h1>
                  <p className="day-center-hero__lead">
                    מרכז יום לותיק הינו מסגרת חברתית קהילתית תומכת ומעשירה לוותיקים
                    במטה יהודה.
                  </p>
                </div>
                <div className="day-center-hero__action">
                  <button
                    type="button"
                    className="day-center-register-btn"
                    onClick={() => setShowDayCenterForm(true)}
                  >
                    הרשמה
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="day-center-main" aria-label="תוכן מרכז יום">
        <section className="day-center-feature-image" aria-label="לוח שבועי">
          <div className="day-center-section-header day-center-section-header--center">
            <div className="day-center-feature-image__title-divider">
              <span className="day-center-feature-image__title-line" aria-hidden="true" />
              <h2 className="day-center-section-title">לוח שבועי</h2>
              <span className="day-center-feature-image__title-line" aria-hidden="true" />
            </div>
          </div>
          {loozUrl && (
            <button
              type="button"
              className="day-center-feature-image__trigger"
              onClick={() => setShowScheduleModal(true)}
              aria-label="הגדלת לוח שבועי"
            >
              <img
                src={loozUrl}
                alt="לוח שבועי – מרכז יום לותיק מטה-יהודה"
                loading="lazy"
                decoding="async"
              />
            </button>
          )}
        </section>

        {showScheduleModal && loozUrl && (
          <div
            className="day-center-schedule-modal"
            role="presentation"
            onClick={() => setShowScheduleModal(false)}
          >
            <button
              type="button"
              className="day-center-schedule-modal__close"
              onClick={() => setShowScheduleModal(false)}
              aria-label="סגירה"
            >
              ×
            </button>
            <img
              className="day-center-schedule-modal__image"
              src={loozUrl}
              alt="לוח שבועי – מרכז יום לותיק מטה-יהודה"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}

        <section className="day-center-stats" aria-label="נתונים">
          <div className="day-center-stats__grid">
            {STATS.map((stat) => (
              <article className="day-center-stat-card" key={stat.label}>
                <span className="day-center-stat-card__value">{stat.value}</span>
                <span className="day-center-stat-card__label">{stat.label}</span>
                <span className="day-center-stat-card__note">{stat.note}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="day-center-accordion-section" aria-label="מידע מפורט">
          <div className="day-center-section-header">
            <span className="day-center-eyebrow">למידע נוסף</span>
            <h2 className="day-center-section-title">פרטים על המרכז</h2>
            <p className="day-center-section-intro">לחצו על נושא לפתיחת התוכן.</p>
          </div>

          <div className="day-center-accordion">
            {SECTIONS.map((section) => {
              const isOpen = openSection === section.id;

              return (
                <article
                  className={`day-center-accordion-item${isOpen ? " is-open" : ""}`}
                  key={section.id}
                >
                  <button
                    type="button"
                    className="day-center-accordion-trigger"
                    aria-expanded={isOpen}
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="day-center-accordion-title">{section.title}</span>
                    <span className="day-center-expand-icon" aria-hidden="true" />
                  </button>
                  <div className="day-center-accordion-body" hidden={!isOpen}>
                    {section.content}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="day-center-gallery" aria-label="גלריית תמונות">
          <h2 className="day-center-gallery__title">רגעים מהמרכז</h2>
          <div className="day-center-gallery__grid">
            {GALLERY_IMAGES.map((image) => (
              <figure
                className={`day-center-gallery__card day-center-gallery__card--${image.orientation}`}
                key={image.src}
              >
                <div className="day-center-gallery__media">
                  <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                </div>
              </figure>
            ))}
          </div>
        </section>
      </main>

      {showDayCenterForm && (
        <DayCenterRegisterForm onClose={() => setShowDayCenterForm(false)} />
      )}
    </div>
  );
}

export default DayCenterPage;
