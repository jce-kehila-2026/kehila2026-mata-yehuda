import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function PaymentSuccess() {
    
    const navigate = useNavigate();

  useEffect(() => {

    const capturePayment = async () => {

      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");

      try {

        const response = await fetch(
          "http://localhost:5001/capture-paypal-order",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              orderID: token,

              firstName: localStorage.getItem("firstName"),
              lastName: localStorage.getItem("lastName"),
              phone: localStorage.getItem("phone"),

              paymentMethod: "PayPal/Credit Card",
              amount: 50,
            }),
          }
        );

        const data = await response.json();

        console.log(data);

      } catch (error) {
        console.error(error);
      }
    };

    capturePayment();

  }, []);

  return (
    <div>
      <h1>העסקה בוצעה בהצלחה!!</h1>
      <br/>
      <button onClick={() => navigate("/")}>חזרה למסך הראשי</button>

    </div>
  );
}

export default PaymentSuccess;