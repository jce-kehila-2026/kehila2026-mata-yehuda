import { useEffect, useState } from "react";
import ProgramCard from "../components/ProgramCard";
import { getAllPrograms } from "../services/programService";
import RequestBox from "../components/RequestBox";
import { useNavigate } from "react-router-dom";
import ActivityCalendar from "../components/ActivityCalendar";
import { getAllActivities } from "../services/activitiesService";

function Home() {
  const [programs, setPrograms] = useState([]);
  const [showLoginOptions ,setShowLoginOptions]=useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

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

      const activitiesData = await getAllActivities();
      setActivities(activitiesData);
      
      setLoading(false);

    }

    loadPrograms();
  }, []);

  return (
   
    <div className="home-page">
       <div className="login-area"> 
       
        <button onClick={()=> setShowLoginOptions(!showLoginOptions)}>התחברות</button>
        {
          showLoginOptions &&(
            <div className="login-box">
              <button>מנהל</button>
              <button>מתנדב</button>
            </div>
          )
        }
      </div>
      <h1>פעילויות</h1>
      
      {loading && <p>טוען פעילויות...</p>}

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
              <button>הרשמה</button>
              <button>התנדב</button>
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

      <RequestBox />
      <ActivityCalendar activities={activities} />

    </div>
  );
}

export default Home;