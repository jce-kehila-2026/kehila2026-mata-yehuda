import { useState } from "react";

function PaymentForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    paymentMethod: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.paymentMethod) {
      alert("בבקשה תמלא את כל הפרטים");
      return;
    }

    if (formData.paymentMethod === "cash") {
      try {
        const response = await fetch("http://localhost:5001/save-cash-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            paymentMethod: "cash",
            amount: 50,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("המקום שלך שמור. התשלום במזומן יתבצע ביום האירוע או לפני כן.");
        } else {
          alert("הייתה שגיאה בשמירת ההרשמה");
        }

        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          paymentMethod: "",
        });
      } catch (error) {
        console.error(error);
        alert("שגיאה בחיבור לשרת");
      }
    }
    else if (formData.paymentMethod === "paypal" || formData.paymentMethod === "credit card") {
        try {
            const response = await fetch("http://localhost:5001/create-paypal-order", {
            method: "POST",
            });

            console.log("response status:", response.status);

            const data = await response.json();
            console.log("paypal data:", data);

            if (!data.links) {
            alert("PayPal did not return links. Check server terminal.");
            return;
            }

            const approveLink = data.links.find((link) => link.rel === "approve");

            if (!approveLink) {
            alert("No approve link found");
            return;
            }

            window.location.href = approveLink.href;
            localStorage.setItem("firstName", formData.firstName);
            localStorage.setItem("lastName", formData.lastName);
            localStorage.setItem("phone", formData.phone);
        } catch (error) {
            console.error("FULL ERROR:", error);
            alert("Error: " + String(error));
        }
    }
    else if (formData.paymentMethod === "bit") {

        try {

          const response = await fetch(
            "http://localhost:5001/save-bit-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                paymentMethod: "bit",
                amount: 50,
              }),
            }
          );

          const data = await response.json();

          if (data.success) {

            alert(
              "ההרשמה נשמרה. אנא בצעו תשלום ב-Bit למספר 050-0000000"
            );

            setFormData({
              firstName: "",
              lastName: "",
              phone: "",
              paymentMethod: "",
            });

          }

        } catch (error) {

          console.error(error);

        }
      }
     else {
      alert(`Redirecting to ${formData.paymentMethod} payment...`);
    }

    console.log(formData);
  };

  return (
    <form onSubmit={handlePayment}>
        
      <input
        type="text"
        name="firstName"
        placeholder="שם פרטי"
        value={formData.firstName}
        onChange={handleChange}
      />

      <input
        type="text"
        name="lastName"
        placeholder="שם משפחה"
        value={formData.lastName}
        onChange={handleChange}
      />

      <input
        type="tel"
        name="phone"
        placeholder="מספר טלפון"
        value={formData.phone}
        onChange={handleChange}
      />

      <h3>בחר שיטת התשלום:</h3>

            <label>
        <input
          type="radio"
          name="paymentMethod"
          value="credit card"
          onChange={handleChange}
        />
        כרטיס אשראי
      </label>

      <br/>

      <label>
        <input
          type="radio"
          name="paymentMethod"
          value="paypal"
          onChange={handleChange}
        />
        PayPal
      </label>

      <br/>

      <label>
        <input
          type="radio"
          name="paymentMethod"
          value="bit"
          onChange={handleChange}
        />
        Bit
      </label>

      <br/>

      <label>
        <input
          type="radio"
          name="paymentMethod"
          value="cash"
          onChange={handleChange}
        />
        מזומן
      </label>

      <br />

      <button type="submit">שלם</button>
    </form>
  );
}

export default PaymentForm;