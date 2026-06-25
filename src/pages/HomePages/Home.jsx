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
import ProgramRegistrationForm from "../../components/Homecomponents/ProgramRegistrationForm";
import { scrollToHomeSection } from "../../utils/homeSectionScroll";

import "../../styles/HomeStyle/Home.css";
import "../../styles/HomeStyle/ProgramCard.css";
import "../../styles/HomeStyle/RequestBox.css";
import "../../styles/HomeStyle/Form.css";

const HOME_PROGRAM_TITLES = {
  day_center: "מרכז יום",
  "60_plus_minus": "60+ מינוס",
  supportive_community: "קהילה תומכת",
};

const PROGRAMS_PAGE_SIZE = 3;

function Home() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDayCenterForm, setShowDayCenterForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [visibleProgramCount, setVisibleProgramCount] = useState(PROGRAMS_PAGE_SIZE);

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
      scrollToHomeSection(hash);
      window.history.replaceState(null, "", window.location.pathname);
    }, 200);

    return () => window.clearTimeout(timer);
  }, []);

  const visiblePrograms = programs.slice(0, visibleProgramCount);
  const hasMorePrograms = programs.length > PROGRAMS_PAGE_SIZE;
  const canShowMorePrograms = visibleProgramCount < programs.length;

  function handleShowMorePrograms() {
    setVisibleProgramCount((current) =>
      Math.min(current + PROGRAMS_PAGE_SIZE, programs.length)
    );
  }

  function handleShowLessPrograms() {
    setVisibleProgramCount(PROGRAMS_PAGE_SIZE);
  }

  function renderProgramButtons(program) {
    if (program.id === "supportive_community") {
      return (
        <button onClick={() => navigate("/supportive-community")}>
          מידע נוסף והרשמה
        </button>
      );
    }

    if (program.id === "60_plus_minus") {
      return (
        <button onClick={() => navigate("/plus60")}>הצג פעילויות</button>
      );
    }

    if (program.id === "day_center") {
      return (
        <div className="program-card__day-actions">
          <button onClick={() => navigate("/day-center")}>
            מידע נוסף והרשמה
          </button>
          <button
            className="volunteer-btn"
            onClick={() => setShowVolunteerForm(true)}
          >
            התנדב
          </button>
        </div>
      );
    }

    return <button onClick={() => setSelectedProgram(program)}>הרשמה</button>;
  }

  return (
    <div className="home-page">
      <HomeNavbar />

      <div className="home-hero-block">
        <section className="hero-section">
          <div className="hero-overlay">
            <h1>הבית החם של ותיקי מטה יהודה</h1>
            <p>
              אנחנו כאן כדי להעניק לכם קהילה תומכת,
              פעילויות עשירות וביטחון אישי.
            </p>
          </div>
        </section>

        <div className="home-hero-block__transition" aria-hidden="true">
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,56 L0,40 C180,18 360,46 540,30 C720,14 900,42 1080,26 C1260,10 1320,34 1440,20 L1440,56 Z" />
          </svg>
          <img
            src="/images/minitree.png"
            alt=""
            className="home-hero-block__minitree"
          />
        </div>
      </div>

      <header id="services" className="home-services-header">
        <div className="home-services-header__divider">
          <span className="home-services-header__line" aria-hidden="true" />
          <div className="home-services-header__core">
            <img
              src="/images/minitree.png"
              alt=""
              className="home-services-header__leaf"
              aria-hidden="true"
            />
            <h2 className="home-services-header__title">השירותים שלנו</h2>
            <img
              src="/images/minitree.png"
              alt=""
              className="home-services-header__leaf home-services-header__leaf--flip"
              aria-hidden="true"
            />
          </div>
          <span className="home-services-header__line" aria-hidden="true" />
        </div>
      </header>

      {loading && <p>טוען תוכניות...</p>}

      <div className="programs-grid">
        {visiblePrograms.map((program) => (
          <ProgramCard
            key={program.id}
            program={{
              ...program,
              title: HOME_PROGRAM_TITLES[program.id] || program.title,
            }}
            buttons={renderProgramButtons(program)}
          />
        ))}
      </div>

      {hasMorePrograms && (
        <div className="home-programs-actions">
          {canShowMorePrograms ? (
            <button
              type="button"
              className="home-programs-more-btn"
              onClick={handleShowMorePrograms}
              aria-label="הצג עוד תוכניות"
            >
              ↓
            </button>
          ) : (
            <button
              type="button"
              className="home-programs-more-btn"
              onClick={handleShowLessPrograms}
              aria-label="הצג פחות תוכניות"
            >
              ↑
            </button>
          )}
        </div>
      )}

      <div className="home-action-cards">
        <div id="requests" className="home-requests-wrap home-section-anchor">
          <RequestBox />
        </div>
        <div id="donations" className="home-donations-wrap home-section-anchor">
          <DonationBox />
        </div>
      </div>

      {showDayCenterForm && (
        <DayCenterRegisterForm onClose={() => setShowDayCenterForm(false)} />
      )}
      {showVolunteerForm && (
        <VolunteerForm onClose={() => setShowVolunteerForm(false)} />
      )}
      {selectedProgram && (
        <ProgramRegistrationForm
          program={{
            ...selectedProgram,
            title: HOME_PROGRAM_TITLES[selectedProgram.id] || selectedProgram.title,
          }}
          onClose={() => setSelectedProgram(null)}
        />
      )}

      <ContactFooter />
    </div>
  );
}

export default Home;
