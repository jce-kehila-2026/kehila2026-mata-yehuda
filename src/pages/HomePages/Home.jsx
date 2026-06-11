import { useEffect, useState } from "react";
import ProgramCard from "../../components/Homecomponents/ProgramCard";
import { getAllPrograms } from "../../services/HomeServices/programService";
import RequestBox from "../../components/Homecomponents/RequestBox";
import { useNavigate } from "react-router-dom";
import DayCenterRegisterForm from "../../components/Homecomponents/DayCenterRegisterForm";
import VolunteerForm from "../../components/Homecomponents/VolunteerForm";

import "../../style/HomeStyle/Home.css";
import "../../style/HomeStyle/ProgramCard.css";
import "../../style/HomeStyle/RequestBox.css";
import "../../style//HomeStyle/Form.css";

function Home() {
  const [programs, setPrograms] = useState([]);
  const [showLoginOptions ,setShowLoginOptions]=useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showDayCenterForm, setShowDayCenterForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
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

  return (
      <div className="home-page">
      <header className="home-header">
      <div className="brand-area">
        <img src="/images/logo.png" alt="לוגו העמותה" className="brand-logo" />
      </div>

      <nav className="top-nav">
        <button onClick={() => navigate("/about")}>מי אנחנו</button>
        <button onClick={() => navigate("/services")}>השירותים שלנו</button>
        <button onClick={() => setShowContact(true)}>צור קשר</button>
      </nav>

      <div className="login-area">
        <button onClick={() => setShowLoginOptions(!showLoginOptions)}>
          התחברות
        </button>

        {showLoginOptions && (
          <div className="login-box">
            <button>מנהל</button>
            <button>מתנדב</button>
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
        
      {loading && <p>טוען תוכניות...</p>}
      
      <div className="programs-grid">
      {programs.map((program) => {
        let buttons;

         
        if (program.id === "supportive_community") {
          buttons = <button> מידע נוסף והרשמה</button>;
        }
        else if  (program.id === "60_plus_minus") {
          buttons = <button onClick={()=> navigate("/plus60")}>הצג פעילויות</button>;
        } 
        else if (program.id === "day_center" ) {
          buttons = (
            <>
              <div className="top-buttons">
              <button onClick={() => setShowDayCenterForm(true)}>הרשמה</button>
              </div>
              <button  className="volunteer-btn"  onClick={()=> setShowVolunteerForm(true)}>התנדב</button>
            </>
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
      <RequestBox />

      {showDayCenterForm && (
         <DayCenterRegisterForm
          onClose={() => setShowDayCenterForm(false)}
         />
      )}
      {showVolunteerForm && (
         <VolunteerForm
          onClose={() => setShowVolunteerForm(false)}
        />
      )}
      {showContact && (
        <div className="contact-popup">
          <div className="contact-popup-box">
            <button onClick={() => setShowContact(false)}>×</button>

            <h2>צור קשר</h2>
            <p>📞 04-1234567</p>
            <p>✉️ info@shalva.org.il</p>
            <p>📍 מטה יהודה</p>
          </div>
        </div>
      )}
    </div>
    
  );
}

export default Home;