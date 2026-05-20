import { useNavigate } from "react-router-dom";


function PaymentCancel() {
    const navigate = useNavigate();
  return (
    <div>
      <h1>!!התשלום לא הצליח</h1>

      <p>
        ניתן לנסות שוב או לבחור שיטת תשלום אחרת
      </p>

      <br/>

      <button onClick={() => navigate("/")}>חזרה למסך הראשי</button>

    </div>
  );
}

export default PaymentCancel;