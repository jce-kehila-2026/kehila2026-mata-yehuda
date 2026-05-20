//כאן אני רוצה להוסיף את העמוד הsאשי של התשלום 
import PaymentForm from "../components/PaymentForm";

function PaymentPage(){
    return (
    <div>
      <h1>תשלום</h1>
      <PaymentForm />
    </div>
    // <div> 
    //   <label>שם פרטי:</label>
    //   <input type="text" />
    //   <br />
    //   <label>שם משפחה:</label>
    //   <input type="text" />
    //   <br />
    //   <label>מספר טלפון:</label>
    //   <input type="tel" />
    //   <br />
    //   <label>שיטת התשלום:</label>
    //   <select>
    //     <option>כרטיס אשראי</option>
    //     <option>Bit</option>
    //     <option>PayPal</option>
    //     <option>מזומן</option>
    //   </select>
    //   <br />
    //   <button>שלם</button>
    //   <br />
    // </div>
    );
}

export default PaymentPage;