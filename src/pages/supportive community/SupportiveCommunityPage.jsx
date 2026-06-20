import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/supportive community/SupportiveCommunityPage.css";

/* Demo hero image — replace with organization photo when available */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1762955911431-4c44c7c3f408?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGVsZGVybHklMjB2b2x1bnRlZXJ8ZW58MHx8MHx8fDA%3D";

const VOLUNTEER_INITIAL_COUNT = 6;

const FIXED_SERVICES = [
  {
    title: "מוקד מצוקה רפואי",
    text: "חיבור למוקד מצוקה רפואי הנותן מענה במקרי חירום, כולל התייעצות עם רופא, ביקור רופא בבית או הזמנת אמבולנס.",
    details:
      "המוקד פעיל מסביב לשעון ומאפשר התייעצות רפואית מיידית, הזמנת ביקור רופא בבית, ותיאום אמבולנס בעת הצורך.",
    icon: "medical",
  },
  {
    title: "אב קהילה",
    text: "אב הקהילה שומר על קשר אישי וקבוע עם חברי הקהילה, זמין טלפונית, מבקר בבתים, מסייע בפתרון בעיות ומקבל דיווחים ממוקד המצוקה.",
    details:
      "איש קשר אישי וקבוע — זמין לשיחה, לביקור בית ולסיוע בפתרון בעיות יומיומיות.",
    icon: "community",
  },
  {
    title: "תיקונים קלים בבית",
    text: "סיוע בתיקונים בסיסיים בבית, כגון תיקוני רשתות, מנעולים, דלתות, אינסטלציה קלה והתקנת מעקי בטיחות.",
    details:
      "צוות מיומן מגיע לביתכם לתיקונים קלים שמשפרים את הבטיחות והנוחות.",
    icon: "tools",
  },
  {
    title: "קישור לבעלי מקצוע",
    text: "במקרים שבהם נדרש תיקון מקצועי יותר, הקהילה מסייעת בחיבור לבעלי מקצוע אמינים.",
    details:
      "מפנים אתכם לבעלי מקצוע אמינים ומוכרים — חשמלאים, שרברבים, טכנאים ואנשי מקצוע נוספים.",
    icon: "link",
  },
  {
    title: "ביקורי בית ושיחה",
    text: "ביקורים בבית לצורך שיחה, הקשבה ושמירה על קשר רציף עם האזרחים הוותיקים ובני משפחותיהם.",
    details: "ביקורים לשיחה, הקשבה וחיבור אנושי — כדי שלא תרגישו לבד.",
    icon: "visit",
  },
  {
    title: "ייעוץ וסיוע בזכויות",
    text: "ייעוץ וסיוע בנושאים כמו חוק סיעוד, עובדים זרים וזכויות נוספות.",
    details:
      "יועצים מנוסים מסייעים בהבנת הזכויות שלכם ומיצוי זכויות מול גורמים רשמיים.",
    icon: "rights",
  },
];

const VOLUNTEER_SERVICES = [
  { label: "קניות", icon: "shopping" },
  { label: "רכישת תרופות", icon: "pharmacy" },
  { label: "ביקור חברתי", icon: "social" },
  { label: "שיחה והקשבה", icon: "chat" },
  { label: "ליווי", icon: "escort" },
  { label: "עזרה קלה בבית", icon: "home" },
  { label: "עזרה ברכישת ציוד נדרש", icon: "equipment" },
  { label: "קריאת ספרים", icon: "books" },
  { label: "משחקים ופעילות חברתית", icon: "games" },
  { label: "עזרה בטלפון או במחשב", icon: "tech" },
  { label: "שירות נוסף לפי הצורך", icon: "extra" },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "מצטרפים לקהילה",
    text: "ממלאים טופס הצטרפות קצר באתר.",
    icon: "step-join",
  },
  {
    step: 2,
    title: "מבקשים שירות",
    text: "לאחר ההצטרפות ניתן לבקש שירות נוסף דרך האתר לפי הצורך.",
    icon: "step-request",
  },
  {
    step: 3,
    title: "התאמת שירות או מתנדב",
    text: "צוות העמותה מתאים שירות מתאים או מתנדב לפי הבקשה.",
    icon: "step-match",
  },
  {
    step: 4,
    title: "מקבלים סיוע",
    text: "מקבלים תמיכה, ליווי וסיוע בבית ובקהילה.",
    icon: "step-support",
  },
];

const CONTACTS = [
  { name: "רכזת הקהילה — שרה", phone: "02-9958649", tel: "+97229958649" },
  { name: "מנהלת הקהילה — אילנה", phone: "050-2182051", tel: "+972502182051" },
  { name: "אב קהילה — מאיר", phone: "052-7250847", tel: "+972527250847" },
];

const FAQ_ITEMS = [
  {
    question: "כמה עולה השירות?",
    answer:
      "עלות חודשית רגילה היא 160 ₪. קיימות הנחות לזכאים. ייתכנו השתתפויות עצמיות לשירותים מסוימים.",
  },
  {
    question: "איך מצטרפים?",
    answer:
      "ממלאים בקשת הצטרפות באתר. צוות העמותה יצור קשר להשלמת הפרטים ובדיקת זכאות.",
  },
  {
    question: "איך מבקשים עזרה?",
    answer:
      "חברי קהילה מגישים בקשת שירות נוסף דרך האתר לאחר בדיקת חברות.",
  },
  {
    question: "האם אפשר להתנדב?",
    answer: "כן. ניתן למלא טופס התנדבות באתר ונחזור אליכם.",
  },
  {
    question: "האם ניתן לבטל הרשמה?",
    answer: "כן. ניתן לפנות לצוות העמותה בכל עת.",
  },
];

function ServiceIcon({ type }) {
  const icons = {
    medical: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a5 5 0 0 0-5 5v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5zm-3 7V7a3 3 0 1 1 6 0v2H9z" />
      </svg>
    ),
    community: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    tools: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
      </svg>
    ),
    link: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
      </svg>
    ),
    visit: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
      </svg>
    ),
    rights: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
    shopping: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    ),
    pharmacy: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
      </svg>
    ),
    social: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    chat: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
      </svg>
    ),
    escort: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
      </svg>
    ),
    home: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
      </svg>
    ),
    equipment: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z" />
      </svg>
    ),
    books: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
      </svg>
    ),
    games: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.5 6.5C15.5 5.12 14.38 4 13 4s-2.5 1.12-2.5 2.5S11.62 9 13 9s2.5-1.12 2.5-2.5zM5.5 6.5C5.5 5.12 4.38 4 3 4S.5 5.12.5 6.5 1.62 9 3 9s2.5-1.12 2.5-2.5zm14.5 4.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm-14 0C4.62 11 3.5 12.12 3.5 13.5S4.62 16 6 16s2.5-1.12 2.5-2.5S7.38 11 6 11zm7 2.5c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z" />
      </svg>
    ),
    tech: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
      </svg>
    ),
    extra: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
      </svg>
    ),
    "step-join": (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    "step-request": (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
    "step-match": (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.11 0-2.08.58-2.62 1.45-.54-.87-1.51-1.45-2.62-1.45C9.34 5 8 6.34 8 8s1.34 3 3 3c.78 0 1.48-.3 2.01-.77.53.47 1.23.77 2.01.77 1.66 0 2.99-1.34 2.99-3S17.66 5 16 5zM8 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    "step-support": (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  };

  return <span className="sc-icon">{icons[type] || icons.extra}</span>;
}

function SupportiveCommunityPage() {
  const navigate = useNavigate();
  const [expandedService, setExpandedService] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [showAllVolunteerServices, setShowAllVolunteerServices] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const visibleVolunteerServices = showAllVolunteerServices
    ? VOLUNTEER_SERVICES
    : VOLUNTEER_SERVICES.slice(0, VOLUNTEER_INITIAL_COUNT);

  const toggleService = (index) => {
    setExpandedService((prev) => (prev === index ? null : index));
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="supportive-community-page" dir="rtl">
      <a className="skip-link" href="#main-content">
        דלג לתוכן העיקרי
      </a>

      <div className="site-header">
        <div className="site-header-inner">
          <span className="site-brand">עמותת ותיקי מטה יהודה</span>
          <span className="site-program">קהילה תומכת</span>
        </div>
      </div>

      <nav className="community-home-nav" aria-label="ניווט חזרה">
        <div className="community-home-nav-inner">
          <Link className="community-home-nav-link" to="/">
            ← חזרה לדף הראשי
          </Link>
        </div>
      </nav>

      <header className="community-hero">
        <div className="hero-shell">
          <div className="hero-banner">
            <img
              className="hero-image"
              src={HERO_IMAGE}
              alt="מתנדבים מסייעים לאזרחים ותיקים — תמיכה קהילתית וליווי"
              width={1000}
              height={560}
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="hero-panel">
              <p className="hero-org">עמותת ותיקי מטה יהודה</p>
              <h1>קהילה תומכת</h1>
              <p className="hero-lead">
                שירותי תמיכה, ליווי וסיוע לבני 62+ בבית ובקהילה.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-hero"
                onClick={() => navigate("/community-join")}
              >
                בקשת הצטרפות לקהילה תומכת
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="page-main">
        <section
          className="page-section page-section--white"
          aria-labelledby="fixed-services-title"
        >
          <div className="page-wrap">
            <div className="section-header">
              <span className="section-eyebrow">מה מקבלים</span>
              <h2 id="fixed-services-title">שירותים קבועים</h2>
              <p className="section-intro">לחצו על שירות לפרטים נוספים.</p>
            </div>

            <div className="services-grid services-grid--fixed">
              {FIXED_SERVICES.map((service, index) => {
                const isOpen = expandedService === index;
                return (
                  <article
                    className={`service-card${isOpen ? " is-open" : ""}`}
                    key={service.title}
                  >
                    <button
                      type="button"
                      className="service-card-trigger"
                      aria-expanded={isOpen}
                      onClick={() => toggleService(index)}
                    >
                      <span className="service-icon-wrap">
                        <ServiceIcon type={service.icon} />
                      </span>
                      <span className="service-card-title">{service.title}</span>
                      <span className="expand-icon" aria-hidden="true" />
                    </button>
                    <div className="service-card-body" hidden={!isOpen}>
                      <p>{service.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="page-section page-section--accent"
          aria-labelledby="payment-title"
        >
          <div className="page-wrap">
            <div className="section-header">
              <span className="section-eyebrow">שקיפות</span>
              <h2 id="payment-title">מחיר ותנאים</h2>
            </div>

            <div className="pricing-block">
              <div className="price-highlight">
                <span className="price-label">עלות חודשית רגילה</span>
                <span className="price-value">160 ₪</span>
              </div>

              <p className="payment-discounts">
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
                ההצטרפות היא בקשה ראשונית בלבד. צוות העמותה יצור קשר להשלמת
                הפרטים, בדיקת זכאות והסדרת התשלום.
              </p>
            </div>
          </div>
        </section>

        <section
          className="page-section page-section--surface"
          aria-labelledby="how-it-works-title"
        >
          <div className="page-wrap">
            <div className="section-header section-header--center">
              <span className="section-eyebrow">איך זה עובד</span>
              <h2 id="how-it-works-title">התהליך בקצרה</h2>
            </div>

            <ol className="steps-timeline">
              {HOW_IT_WORKS.map((item) => (
                <li className="step-card" key={item.step}>
                  <span className="step-number">{item.step}</span>
                  <div className="step-content">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="page-section page-section--cta" aria-label="פעולות">
          <div className="page-wrap">
            <div className="actions-panel">
              <h2 className="actions-title">מה תרצו לעשות?</h2>
              <p className="actions-intro">
                בחרו את הפעולה המתאימה לכם. נחזור אליכם בהקדם האפשרי.
              </p>

              <div className="actions-buttons">
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
              </div>
            </div>
          </div>
        </section>

        <section
          className="page-section page-section--white"
          aria-labelledby="volunteer-services-title"
        >
          <div className="page-wrap">
            <div className="section-header">
              <span className="section-eyebrow">בקשה לפי צורך</span>
              <h2 id="volunteer-services-title">
                שירותים נוספים באמצעות מתנדבים
              </h2>
            </div>

            <ul className="volunteer-card-grid">
              {visibleVolunteerServices.map((item) => (
                <li className="volunteer-card" key={item.label}>
                  <span className="volunteer-card-icon">
                    <ServiceIcon type={item.icon} />
                  </span>
                  <span className="volunteer-card-label">{item.label}</span>
                </li>
              ))}
            </ul>

            {!showAllVolunteerServices && (
              <button
                type="button"
                className="btn btn-text-expand"
                onClick={() => setShowAllVolunteerServices(true)}
              >
                הצג את כל השירותים ({VOLUNTEER_SERVICES.length})
              </button>
            )}
          </div>
        </section>

        <section
          className="page-section page-section--surface"
          aria-labelledby="faq-title"
        >
          <div className="page-wrap page-wrap--compact">
            <div className="section-header section-header--center">
              <span className="section-eyebrow">שאלות נפוצות</span>
              <h2 id="faq-title">שאלות ותשובות</h2>
            </div>

            <div className="faq-list">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    className={`faq-item${isOpen ? " is-open" : ""}`}
                    key={item.question}
                  >
                    <button
                      type="button"
                      className="faq-trigger"
                      aria-expanded={isOpen}
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{item.question}</span>
                      <span className="expand-icon" aria-hidden="true" />
                    </button>
                    <div className="faq-answer" hidden={!isOpen}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="community-footer">
        <div className="footer-inner">
          <p className="footer-org">עמותת ותיקי מטה יהודה</p>
          <p className="footer-tagline">
            מלווים אתכם בכבוד, בחמימות ובאמון — לחיים טובים יותר בבית ובקהילה
          </p>
        </div>
      </footer>

      <div className="floating-contact">
        {contactOpen && (
          <div
            className="floating-contact-panel"
            role="dialog"
            aria-label="יצירת קשר"
          >
            <p className="floating-contact-title">יש לכם שאלה? דברו איתנו</p>
            <div className="floating-contact-list">
              {CONTACTS.map((contact) => (
                <a
                  className="floating-contact-link"
                  key={contact.name}
                  href={`tel:${contact.tel}`}
                >
                  <span className="floating-contact-name">{contact.name}</span>
                  <span className="floating-contact-phone">{contact.phone}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="floating-contact-btn"
          aria-expanded={contactOpen}
          aria-label="יצירת קשר"
          onClick={() => setContactOpen((prev) => !prev)}
        >
          יצירת קשר
        </button>
      </div>
    </div>
  );
}

export default SupportiveCommunityPage;
