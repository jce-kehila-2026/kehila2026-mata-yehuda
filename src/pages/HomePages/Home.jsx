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
import { Mail, MapPin, Phone } from "lucide-react";

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
      <header className="home-header">
      <div className="brand-area">
        <img src="/images/logo.png" alt="לוגו העמותה" className="brand-logo" />
      </div>

      <nav className="top-nav">
        <button onClick={() => navigate("/about")}>מי אנחנו</button>
        <button onClick={scrollToDonations}>תרומות</button>
        <button onClick={scrollToContact}>צור קשר</button>
      </nav>

      <div className="login-area">
        <button onClick={() => setShowLoginOptions(!showLoginOptions)}>
          התחברות
        </button>

        {showLoginOptions && (
          <div className="login-box">
            <button onClick={() => navigate("/staff-login")}>מנהל</button>
          </div>
        )}
      </div>
    </header>
    <section className="hero-section">
      <div className="hero-overlay">
        <h1>הבית החם של ותיקי מטה יהודה</h1>
        <p>
          אנחנו כאן כדי להעניק לכם קהילה תומכת,
          פעילויות עשירות וביטחון אישי.
        </p>
      </div>
    </section>

      <header className="home-services-header">
        <div className="home-services-header__divider">
          <span className="home-services-header__line" aria-hidden="true" />
          <h2 className="home-services-header__title">השירותים שלנו</h2>
          <span className="home-services-header__line" aria-hidden="true" />
        </div>
      </header>

      {loading && <p>טוען תוכניות...</p>}
      
      <div className="programs-grid">
      {programs.map((program) => {
        let buttons;

         
        if (program.id === "supportive_community") {
          buttons = <button onClick={() => navigate("/supportive-community")}> מידע נוסף והרשמה</button>;
        }
        else if  (program.id === "60_plus_minus") {
          buttons = <button onClick={()=> navigate("/plus60")}>הצג פעילויות</button>;
        } 
        else if (program.id === "day_center" ) {
          buttons = (
            <div className="program-card__day-actions">
              <button onClick={() => setShowDayCenterForm(true)}>מידע נוסף והרשמה</button>
              <button className="volunteer-btn" onClick={() => setShowVolunteerForm(true)}>התנדב</button>
            </div>
          );
        } else {
          buttons = <button>הרשמה</button>;
        }

        return (
          <ProgramCard
            key={program.id}
            program={program}
            buttons={buttons}
          />
        );
      })}
      </div>

      <div className="home-action-cards">
        <RequestBox />
        <div ref={donationsRef} className="home-donations-section">
          <DonationBox />
        </div>
      </div>

      {showDayCenterForm && (
        <DayCenterRegisterForm onClose={() => setShowDayCenterForm(false)} />
      )}
      {showVolunteerForm && (
        <VolunteerForm onClose={() => setShowVolunteerForm(false)} />
      )}

      <footer className="home-footer">
        <section className="home-footer__contact" ref={contactRef}>
          <h2 className="home-footer__title">רוצים לשמוע עוד?</h2>
          <p className="home-footer__subtitle">
            צוות שלנו זמין לענות על כל שאלה ולתאם ביקור היכרות ללא התחייבות.
          </p>
          <div className="home-footer__details">
            <span className="home-footer__detail">
              <MapPin size={20} strokeWidth={2} aria-hidden="true" />
              <span>מטה יהודה</span>
            </span>
            <span className="home-footer__detail">
              <Mail size={20} strokeWidth={2} aria-hidden="true" />
              <span>info@shalva.org.il</span>
            </span>
            <span className="home-footer__detail">
              <Phone size={20} strokeWidth={2} aria-hidden="true" />
              <span>04-1234567</span>
            </span>
          </div>
        </section>

        <section className="home-footer__copyright">
          <p>הבית החם של ותיקי מטה יהודה | כל הזכויות שמורות 2026</p>
        </section>
      </footer>

    </div>
  );
}

export default Home;
