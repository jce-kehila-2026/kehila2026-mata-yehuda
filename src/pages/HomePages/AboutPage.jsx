import { useNavigate } from "react-router-dom";
import HomeNavbar from "../../components/Homecomponents/HomeNavbar";
import AboutSection from "../../components/Homecomponents/AboutSection";

import "../../styles/HomeStyle/Home.css";

const ABOUT_GALLERY_IMAGES = [
  { src: "/images/meta1.png", alt: "פינוקים בקהילה", caption: "פינוקים" },
  { src: "/images/meta2.png", alt: "טיולים עם הקהילה", caption: "טיולים" },
  { src: "/images/meta3.png", alt: "יום בריאות בקהילה", caption: "יום בריאות" },
];

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="home-page about-page">
      <HomeNavbar />

      <AboutSection showPageLayout />

      <section className="about-page-gallery" aria-label="גלריית רגעים מהקהילה">
        <div className="about-page-gallery__title-divider">
          <span className="about-page-gallery__title-line" aria-hidden="true" />
          <span className="about-page-gallery__title-core">
            <img
              className="about-page-gallery__leaf about-page-gallery__leaf--start"
              src="/images/leaf-decoration.png"
              alt=""
              aria-hidden="true"
            />
            <h2 className="about-page-gallery__title">רגעים מהקהילה</h2>
            <img
              className="about-page-gallery__leaf about-page-gallery__leaf--end"
              src="/images/leaf-decoration.png"
              alt=""
              aria-hidden="true"
            />
          </span>
          <span className="about-page-gallery__title-line" aria-hidden="true" />
        </div>
        <img
          className="about-page-gallery__heart"
          src="/images/heart-line.png"
          alt=""
          aria-hidden="true"
        />
        <div className="about-page-gallery__grid">
          {ABOUT_GALLERY_IMAGES.map((image) => (
            <figure key={image.src} className="about-page-gallery__card">
              <div className="about-page-gallery__media">
                <img src={image.src} alt={image.alt} loading="lazy" />
              </div>
              <figcaption className="about-page-gallery__caption">{image.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="about-page-gallery__actions">
          <button type="button" className="about-page-gallery__btn">
            צפו בגלריה המלאה
          </button>
        </div>
      </section>

      <section className="about-page-cta" aria-label="חזרה לדף הבית">
        <img
          className="about-page-cta__leaf about-page-cta__leaf--start"
          src="/images/leaf-decoration.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="about-page-cta__leaf about-page-cta__leaf--end"
          src="/images/leaf-decoration.png"
          alt=""
          aria-hidden="true"
        />
        <div className="about-page-cta__inner">
          <div className="about-page-cta__text">
            <h2 className="about-page-cta__title">
              בואו להיות חלק מהקהילה שלנו
            </h2>
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/")}
          >
            חזרה לדף הבית
          </button>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
