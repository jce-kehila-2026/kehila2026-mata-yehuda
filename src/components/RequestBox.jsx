import { useState } from "react";
import { addRequest } from "../services/requestsService";

function RequestBox(){
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(){
        if (phone===""|| message===""){
            alert("נא למלא מספר טלפון ובקשה")
            return;
        }
        await addRequest(phone, message);
        alert(" הפנייה נשלחה בהצלחה")
        setPhone("")
        setMessage("")
    }
    return(
        <div className="request-box">
            <h2>פניות ובקשות</h2>

            <label>מספר טלפון</label>
            <input
                type="text"
                placeholder="הקלד/י מספר טלפון"
                value={phone}
                onChange={(e)=> setPhone(e.target.value)}
            />
            <label>איך נוכל לעזור?</label>
            <textarea
                placeholder="
                זקוקים לעזרה?
                יש לכם רעיון?
                רוצים לשאול שאלה? "
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
            />
            <button onClick={handleSubmit}>שליחת פנייה</button>

            
        </div>
    );
}
export default RequestBox