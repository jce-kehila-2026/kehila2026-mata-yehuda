import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgramCard from "../../components/Homecomponents/ProgramCard";
import { getAllPrograms } from "../../services/HomeServices/programService";
import RequestBox from "../../components/Homecomponents/RequestBox";
import DonationBox from "../../donations/components/DonationBox";
import HomeNavbar from "../../components/Homecomponents/HomeNavbar";
import ContactFooter from "../../components/Homecomponents/ContactFooter";
import DayCenterRegisterForm from "../../components/Homecomponents/DayCenterRegisterForm";
import VolunteerForm from "../../components/Homecomponents/VolunteerForm";

import "../../styles/HomeStyle/Home.css";
import "../../styles/HomeStyle/ProgramCard.css";
import "../../styles/HomeStyle/RequestBox.css";
import "../../styles/HomeStyle/Form.css";

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
  element.classList.add("section-highlight");

  window.setTimeout(() => {
    element.classList.remove("section-highlight");
  }, 2000);
}

function Home() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDayCenterForm, setShowDayCenterForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);

  useEffect(() => {
    async function loadPrograms() {
      const data = await getAllPrograms();

      const order = {
        day_center: 1,
        "60_plus_minus": 2,
        supportive_community: 3,
      };

      const sortedData = data.sort((a, b) => {
        return (order[a.id] || 99) - (order[b.id] || 99);
      });

      setPrograms(sortedData);
      setLoading(false);
    }

    loadPrograms();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      scrollToSection(hash);
      window.history.replaceState(null, "", window.location.pathname);
    }, 150);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="home-page">
      <HomeNavbar />

      <section className="hero-section">
        <div className="hero-overlay">
          <h1>הבית החם של ותיקי מטה יהודה</h1>
          <p>
            אנחנו כאן כדי להעניק לכם קהילה תומכת,
            פעילויות עשירות וביטחון אישי.
          </p>
        </div>
      </section>

      <section
        id="services"
        className="home-services-section home-section-anchor"
      >
        <div className="home-services-section__header">
          <p className="home-section-eyebrow">מה אנחנו מציעים</p>
          <h2 className="home-section-title">השירותים שלנו</h2>
          <p className="home-services-section__subtitle">
            מגוון תוכניות ומסגרות המותאמות לצרכים השונים של ותיקי מטה יהודה
          </p>
        </div>

        {loading && <p className="home-loading-text">טוען תוכניות...</p>}

        <div className="programs-grid">
          {programs.map((program) => {
            let buttons;

            if (program.id === "supportive_community") {
              buttons = (
                <button onClick={() => navigate("/supportive-community")}>
                  מידע נוסף והרשמה
                </button>
              );
            } else if (program.id === "60_plus_minus") {
              buttons = (
                <button onClick={() => navigate("/plus60")}>
                  הצג פעילויות
                </button>
              );
            } else if (program.id === "day_center") {
              buttons = (
                <>
                  <div className="top-buttons">
                    <button onClick={() => setShowDayCenterForm(true)}>הרשמה</button>
                  </div>
                  <button
                    className="volunteer-btn"
                    onClick={() => setShowVolunteerForm(true)}
                  >
                    התנדב
                  </button>
                </>
              );
            } else {
              buttons = <button>הרשמה</button>;
            }

            return (
              <ProgramCard key={program.id} program={program} buttons={buttons} />
            );
          })}
        </div>
      </section>

      <RequestBox />

      <div id="donations" className="home-donations-section home-section-anchor">
        <DonationBox />
      </div>

      {showDayCenterForm && (
        <DayCenterRegisterForm onClose={() => setShowDayCenterForm(false)} />
      )}
      {showVolunteerForm && (
        <VolunteerForm onClose={() => setShowVolunteerForm(false)} />
      )}

      <div id="contact" className="home-section-anchor">
        <ContactFooter />
      </div>
    </div>
  );
}

export default Home;
