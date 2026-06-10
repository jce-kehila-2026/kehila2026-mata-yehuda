import { useEffect, useState } from "react";
import ProgramCard from "../components/ProgramCard";
import { getAllPrograms } from "../services/programService";
import RequestBox from "../components/RequestBox";
import { useNavigate } from "react-router-dom";
import DayCenterRegisterForm from "../components/DayCenterRegisterForm";
import VolunteerForm from "../components/VolunteerForm";

function Home() {
  const [programs, setPrograms] = useState([]);
  const [showLoginOptions ,setShowLoginOptions]=useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

  return (
      <div className="home-page">
      <div className="home-header">
        <div className="brand-area">
          <img src="/images/logo.png" alt="לוגו העמותה" className="brand-logo" />
        </div>

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
      </div>
      <div className="hero-section">
          <h1 className="hero-title">
            עמותת ותיקי מטה יהודה
          </h1>

          <p className="hero-description">
            קהילה, תמיכה ואיכות חיים לוותיקי המועצה
          </p>

      </div> 
      <h1 className="page-title">השירותים שלנו</h1>

      {loading && <p>טוען תוכניות...</p>}
      
      <div className="programs-grid">
      {programs.map((program) => {
        let buttons;

         
        if (program.id === "supportive_community") {
          buttons = <button>פרטים נוספים</button>;
        }
        else if  (program.id === "60_plus_minus") {
          buttons = <button onClick={()=> navigate("/plus60")}>הצג פעילויות</button>;
        } 
        else if (program.id === "day_center" ) {
          buttons = (
            <>
              <button onClick={() => setShowDayCenterForm(true)}>הרשמה</button>
              <button onClick={()=> setShowVolunteerForm(true)}>התנדב</button>
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
      {/* <ActivityCalendar activities={activities} /> */}

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
      <footer className="footer">
        <p>📞 04-1234567 | ✉️ info@shalva.org.il</p>
      </footer>
    </div>
    
  );
}

export default Home;