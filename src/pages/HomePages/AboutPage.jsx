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

      <section className="about-page-hero">
        <h1>מי אנחנו?</h1>
        <p>הכירו את העמותה, החזון והשירותים שאנחנו מעניקים לקהילת הוותיקים</p>
      </section>

      <AboutSection showPageLayout />

      <section className="about-page-gallery" aria-label="גלריית רגעים מהקהילה">
        <div className="about-page-gallery__title-divider">
          <span className="about-page-gallery__title-line" aria-hidden="true" />
          <h2 className="about-page-gallery__title">רגעים מהקהילה</h2>
          <span className="about-page-gallery__title-line" aria-hidden="true" />
        </div>
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
      </section>

      <div className="about-page-back">
        <button type="button" className="secondary-btn" onClick={() => navigate("/")}>
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );
}

export default AboutPage;
