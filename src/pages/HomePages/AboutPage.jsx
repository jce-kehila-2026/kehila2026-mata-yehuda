import { useNavigate } from "react-router-dom";
import HomeNavbar from "../../components/Homecomponents/HomeNavbar";
import AboutSection from "../../components/Homecomponents/AboutSection";

import "../../styles/HomeStyle/Home.css";

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

      <div className="about-page-back">
        <button type="button" className="secondary-btn" onClick={() => navigate("/")}>
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );
}

export default AboutPage;
