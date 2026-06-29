import HomeNavbar from "../../components/Homecomponents/HomeNavbar";

import "../../styles/HomeStyle/Home.css";
import "../../styles/HomeStyle/AboutPage.css";

const ABOUT_GALLERY_IMAGES = [
  { src: "/images/meta1.png", alt: "פינוקים בקהילה", caption: "פינוקים" },
  { src: "/images/meta2.png", alt: "טיולים עם הקהילה", caption: "טיולים" },
  { src: "/images/meta3.png", alt: "יום בריאות בקהילה", caption: "יום בריאות" },
];

const ABOUT_PILLARS = [
  {
    icon: "daycenter",
    title: "מרכז יום לוותיק",
    text: "מסגרת חברתית קהילתית התומכת ומעשירה — מקום עוגן של נוחות, פנים מוכרות ושלווה לוותיקי מטה יהודה.",
  },
  {
    icon: "community",
    title: "קהילה תומכת",
    text: "תכנית המאפשרת לותיק להמשיך להתגורר בביתו, תוך שמירה על איכות חייו, עצמאות וביטחון אישי ורפואי.",
  },
  {
    icon: "clubs",
    title: "מועדוני ותיקים מעושרים",
    text: "מענה לותיקים העצמאיים/חלקית העצמאיים במושבים, להפגת בדידות וליצירת תחושת שייכות ומשמעות.",
  },
];

function PillarIcon({ type }) {
  if (type === "daycenter") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 11.5 12 4l8.5 7.5" />
        <path d="M5.5 10v9h13v-9" />
        <path d="M10 19v-5.5h4V19" />
      </svg>
    );
  }

  if (type === "community") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="8.5" cy="8" r="3" />
        <path d="M3 19a5.5 5.5 0 0 1 11 0" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8" />
        <path d="M16.5 13.5a5.5 5.5 0 0 1 4.5 5.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20.5V8.2l8-4.7 8 4.7v12.3" />
      <path d="M3 20.5h18" />
      <path d="M9.5 20.5V15h5v5.5" />
      <path d="M9.5 10.5h0M14.5 10.5h0" />
    </svg>
  );
}

function AboutPage() {
  return (
    <div className="home-page about2">
      <HomeNavbar />

      {/* 1. HERO — left: photo + mini cards | right: full about text + quote */}
      <section className="about2-hero" aria-label="מי אנחנו">
        <div className="about2-hero__inner">
          {/* LEFT COLUMN: photo + three compact feature cards */}
          <div className="about2-hero__left">
            <div className="about2-hero__media">
              <img
                className="about2-hero__photo"
                src="/images/about-us.png"
                alt="משתתפות וצוות במרכז היום לוותיק מטה יהודה"
              />
            </div>

            <div className="about2-hero__cards">
              {ABOUT_PILLARS.map((item) => (
                <article key={item.title} className="about2-mini-card">
                  <span className="about2-mini-card__icon" aria-hidden="true">
                    <PillarIcon type={item.icon} />
                  </span>
                  <h3 className="about2-mini-card__title">{item.title}</h3>
                  <p className="about2-mini-card__text">{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: intro + about description + quote */}
          <div className="about2-hero__content">
            <div className="about2-hero__intro">
              <svg
                className="about2-hero__heart"
                viewBox="0 0 120 96"
                fill="none"
                aria-hidden="true"
              >
                <path d="M60 82 C30 60 14 44 14 28 C14 16 24 8 36 12 C46 15 55 24 60 33 C65 24 74 15 84 12 C96 8 106 16 106 28 C106 44 90 60 60 82 Z" />
              </svg>
              <span className="about2-eyebrow">אנשים. קהילה. בית.</span>
              <h1 className="about2-hero__title">מי אנחנו?</h1>
              <p className="about2-hero__lead">
                הכירו את העמותה, החזון והשירותים שאנחנו מעניקים לקהילת הוותיקים
                של מטה יהודה.
              </p>
            </div>

            <div className="about2-about__text">
              <span className="about2-about__kicker">עמותת ותיקי מטה-יהודה</span>
              <h2 className="about2-about__title">
                קהילה שמלווה את הוותיק לאורך הדרך
              </h2>
              <p className="about2-about__lead">
                עמותת ותיקי מטה-יהודה פועלת בהתמדה לשיפור איכות חייהם של כלל
                תושבי המועצה הוותיקים ולהרחבת מגוון השירותים והפעילויות המוצעים
                לגיל השלישי.
              </p>
              <p className="about2-about__paragraph">
                אנו מבקשים לאפשר לותיקי המועצה להזדקן בכבוד, בביטחון ובביתם,
                ולהמשיך להיות חלק בלתי נפרד מהקהילה ומהמשפחה שהקימו אותן. העמותה
                שואפת למתן שירות איכותי ומקצועי תוך ראיית הצרכים המשתנים
                והמגוונים של כלל אוכלוסיית גיל השלישי במועצה.
              </p>
              <p className="about2-about__audience">
                <strong>יעד קהל:</strong> כלל תושבי המועצה בגילאי +60 מינוס
              </p>
            </div>
          </div>
        </div>

        <svg
          className="about2-hero__wave"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,45 C320,95 600,5 880,38 C1120,66 1280,84 1440,52 L1440,90 L0,90 Z" />
        </svg>
      </section>

      {/* 2. COMMUNITY note */}
      <section className="about2-community" aria-label="הקהילה שלנו">
        <div className="about2-community__inner">
          <span className="about2-community__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
          <p className="about2-community__text">
            בין משתתפי מרכז היום: ניצולי שואה, ותיקים מהמגזר הערבי, עולים ממדינות
            רבות וחלוצי הארץ — קהילה מגוונת, חמה ומחוברת.
          </p>
        </div>
      </section>

      {/* 3. GALLERY — community images (last section) */}
      <section className="about2-gallery" aria-label="גלריית רגעים מהקהילה">
        <header className="about2-head">
          <div className="about2-head__divider">
            <span className="about2-head__line" aria-hidden="true" />
            <span className="about2-head__core">
              <img
                className="about2-head__leaf"
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
              />
              <h2 className="about2-head__title">רגעים מהקהילה</h2>
              <img
                className="about2-head__leaf about2-head__leaf--end"
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
              />
            </span>
            <span className="about2-head__line" aria-hidden="true" />
          </div>
          <p className="about2-head__subtitle">
            הצצה אל הפעילויות, הטיולים והרגעים המשותפים שמרכיבים את חיי הקהילה
            שלנו.
          </p>
        </header>

        <div className="about2-gallery__grid">
          {ABOUT_GALLERY_IMAGES.map((image) => (
            <figure key={image.src} className="about2-gallery__card">
              <div className="about2-gallery__media">
                <img src={image.src} alt={image.alt} loading="lazy" />
              </div>
              <figcaption className="about2-gallery__caption">
                {image.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
