const PILLARS = [
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

function AboutIcon({ type }) {
  if (type === "daycenter") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === "community") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm-8 0c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-1.5C15 14.2 10.3 13 8 13zm8 0c-.3 0-.6 0-1 .1 1.2.9 2 2 2 3.4V19h6v-1.5c0-2.3-4.7-3.5-7-3.5z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L21 9 12 3zm0 2.18l6 3.12v4.3l-6 3.28-6-3.28v-4.3l6-3.12zM12 12l6-3.28L12 5.44 6 8.72 12 12z"
        fill="currentColor"
      />
    </svg>
  );
}

function AboutSection({ showPageLayout = false }) {
  if (showPageLayout) {
    return (
      <section className="about-modern">
        <img
          className="about-modern__leaf about-modern__leaf--start"
          src="/images/leaf-decoration.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="about-modern__leaf about-modern__leaf--end"
          src="/images/leaf-decoration.png"
          alt=""
          aria-hidden="true"
        />
        <div className="about-modern__hero">
          <div className="about-modern__visual home-about-section__visual">
            <div className="home-about-section__image-glow" />
            <div className="home-about-section__image-wrap">
              <img
                src="/images/about-us.png"
                alt="משתתפות וצוות במרכז היום לוותיק מטה יהודה"
                className="home-about-section__image"
              />
            </div>
            <div className="home-about-section__tag">
              <span>מרכז יום לוותיק</span>
              <strong>מטה יהודה</strong>
            </div>
            <img
              className="about-modern__visual-leaf"
              src="/images/leaf-decoration.png"
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="about-modern__intro">
            <img
              className="about-modern__heart"
              src="/images/heart-line.png"
              alt=""
              aria-hidden="true"
            />
            <p className="home-section-eyebrow about-modern__eyebrow">
              אנשים. קהילה. בית.
            </p>
            <h1 className="about-modern__title">מי אנחנו?</h1>
            <p className="about-modern__lead-intro">
              הכירו את העמותה, החזון והשירותים שאנחנו מעניקים לקהילת הוותיקים
            </p>
          </div>
        </div>

        <div className="about-modern__body">
          <div className="about-modern__text">
            <p className="home-about-section__lead">
              עמותת ותיקי מטה-יהודה פועלת בהתמדה לשיפור איכות חייהם של כלל תושבי
              המועצה הוותיקים ולהרחבת מגוון השירותים והפעילויות המוצעים לגיל
              השלישי.
            </p>
            <p className="home-about-section__text">
              אנו מבקשים לאפשר לותיקי המועצה להזדקן בכבוד, בביטחון ובביתם,
              ולהמשיך להיות חלק בלתי נפרד מהקהילה ומהמשפחה שהקימו אותן. העמותה
              שואפת למתן שירות איכותי ומקצועי תוך ראיית הצרכים המשתנים והמגוונים
              של כלל אוכלוסיית גיל השלישי במועצה.
            </p>
            <p className="home-about-section__audience">
              <strong>יעד קהל:</strong> כלל תושבי המועצה בגילאי +60 מינוס
            </p>
          </div>

          <div className="about-modern__quote-wrap">
            <span className="about-modern__quote-shape" aria-hidden="true" />
            <blockquote className="home-about-section__quote about-modern__quote">
              <span className="about-modern__quote-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.17 6A4.17 4.17 0 003 10.17V18h7v-7H6.5a3.5 3.5 0 013.5-3.5V6H7.17zm9 0A4.17 4.17 0 0012 10.17V18h7v-7h-3.5A3.5 3.5 0 0119 7.5V6h-2.83z" />
                </svg>
              </span>
              <p>״אם יוצאים — מגיעים למקומות נפלאות״</p>
              <cite>דוקטור סוס</cite>
            </blockquote>
          </div>
        </div>

        <p className="home-about-section__community-note">
          בין משתתפי מרכז היום: ניצולי שואה, ותיקים מהמגזר הערבי, עולים ממדינות
          רבות וחלוצי הארץ — קהילה מגוונת, חמה ומחוברת.
        </p>

        <div className="home-about-section__values">
          {PILLARS.map((item) => (
            <article key={item.title} className="home-about-value-card">
              <div className="home-about-value-card__icon">
                <AboutIcon type={item.icon} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`home-about-section${showPageLayout ? " home-about-section--page" : ""}`}
      id={showPageLayout ? undefined : "about"}
    >
      <div className="home-about-section__layout">
        <div className="home-about-section__visual">
          <div className="home-about-section__image-glow" />
          <div className="home-about-section__image-wrap">
            <img
              src="/images/about-us.png"
              alt="משתתפות וצוות במרכז היום לוותיק מטה יהודה"
              className="home-about-section__image"
            />
          </div>
          <div className="home-about-section__tag">
            <span>מרכז יום לוותיק</span>
            <strong>מטה יהודה</strong>
          </div>
        </div>

        <div className="home-about-section__content">
          {!showPageLayout && (
            <>
              <p className="home-section-eyebrow">עמותת ותיקי מטה-יהודה</p>
              <h2 className="home-about-section__title">מי אנחנו</h2>
            </>
          )}

          {showPageLayout && (
            <p className="home-section-eyebrow">עמותת ותיקי מטה-יהודה</p>
          )}

          <p className="home-about-section__lead">
            עמותת ותיקי מטה-יהודה פועלת בהתמדה לשיפור איכות חייהם של כלל תושבי
            המועצה הוותיקים ולהרחבת מגוון השירותים והפעילויות המוצעים לגיל
            השלישי.
          </p>

          <p className="home-about-section__text">
            אנו מבקשים לאפשר לותיקי המועצה להזדקן בכבוד, בביטחון ובביתם,
            ולהמשיך להיות חלק בלתי נפרד מהקהילה ומהמשפחה שהקימו אותן. העמותה
            שואפת למתן שירות איכותי ומקצועי תוך ראיית הצרכים המשתנים והמגוונים
            של כלל אוכלוסיית גיל השלישי במועצה.
          </p>

          <blockquote className="home-about-section__quote">
            <p>״אם יוצאים — מגיעים למקומות נפלאות״</p>
            <cite>דוקטור סוס</cite>
          </blockquote>

          <p className="home-about-section__audience">
            <strong>יעד קהל:</strong> כלל תושבי המועצה בגילאי +60 מינוס
          </p>
        </div>
      </div>

      <p className="home-about-section__community-note">
        בין משתתפי מרכז היום: ניצולי שואה, ותיקים מהמגזר הערבי, עולים ממדינות
        רבות וחלוצי הארץ — קהילה מגוונת, חמה ומחוברת.
      </p>

      <div className="home-about-section__values">
        {PILLARS.map((item) => (
          <article key={item.title} className="home-about-value-card">
            <div className="home-about-value-card__icon">
              <AboutIcon type={item.icon} />
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AboutSection;
