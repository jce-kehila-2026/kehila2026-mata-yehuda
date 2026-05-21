import { useState } from "react";
import { saveVolunteerData, checkIfVolunteerExists } from "../../services/volunteerService";
import "./VolunteerForm.css";
function VolunteerForm() {

  const [volunteerForm, setVolunteerForm] = useState({
    volunteerId: "",
    phone: "",
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    notes: "",
  });

const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !volunteerForm.volunteerId ||
    !volunteerForm.phone ||
    !volunteerForm.firstName ||
    !volunteerForm.lastName ||
    !volunteerForm.gender ||
    !volunteerForm.birthDate ||
    !volunteerForm.address
  ) {
    alert("נא למלא את כל שדות החובה");
    return;
  }

  if (!/^\d{9}$/.test(volunteerForm.volunteerId)) {
    alert("מספר תעודת זהות חייב להיות מספר בן 9 ספרות");
    return;
  }

  if (!/^05\d{8}$/.test(volunteerForm.phone)) {
    alert("מספר טלפון חייב להיות מספר תקין בן 10 ספרות");
    return;
  }

  const exists = await checkIfVolunteerExists(volunteerForm.volunteerId);

  if (exists) {
    const shouldUpdate = window.confirm(
      "מתנדב עם מספר זהות זה כבר קיים במערכת. האם ברצונך לעדכן את הפרטים?"
    );

    if (!shouldUpdate) {
      return;
    }
  }
const volunteerData = {
   ...volunteerForm,
   createdAt: new Date(),
   isActive: true,
};
  try {
    await saveVolunteerData(volunteerForm.volunteerId, volunteerForm);

    alert("המתנדב נשמר בהצלחה");

    setVolunteerForm({
      volunteerId: "",
      phone: "",
      firstName: "",
      lastName: "",
      gender: "",
      birthDate: "",
      address: "",
      notes: "",
    });
  } catch (error) {
    console.error("Error saving volunteer:", error);
    alert("אירעה שגיאה בשמירת הנתונים");
  }
};
  return (
    <form onSubmit={handleSubmit}>
      <h2>Volunteer Registration</h2>
     <div>
      <label>תעודת זהות</label>
      <input
        type="text"
        value={volunteerForm.volunteerId}
        onChange={(e) =>
          setVolunteerForm({
            ...volunteerForm,
            volunteerId: e.target.value,
          })
        }
      />
</div>
<div>
      <label>מספר טלפון</label>
      <input
        type="text"
        value={volunteerForm.phone}
        onChange={(e) =>
          setVolunteerForm({
            ...volunteerForm,
            phone: e.target.value,
          })
        }
      />
</div>
<div>
      <label>שם פרטי</label>
      <input
        type="text"
        value={volunteerForm.firstName}
        onChange={(e) =>
          setVolunteerForm({
            ...volunteerForm,
            firstName: e.target.value,
          })
        }
      />
</div>
<div>
      <label>שם משפחה</label>
      <input
        type="text"
        value={volunteerForm.lastName}
        onChange={(e) =>
          setVolunteerForm({
            ...volunteerForm,
            lastName: e.target.value,
          })
        }
      />
</div>
<div>
      <label>מין</label>
<select
  value={volunteerForm.gender}
  onChange={(e) =>
    setVolunteerForm({
      ...volunteerForm,
      gender: e.target.value,
    })
  }
>
  <option value="">בחר/י מין</option>
  <option value="male">זכר</option>
  <option value="female">נקבה</option>
  <option value="other">אחר</option>
</select>
</div>
<div>
      <label>תאריך לידה</label>
      <input
        type="date"
        value={volunteerForm.birthDate}
        onChange={(e) =>
          setVolunteerForm({
            ...volunteerForm,
            birthDate: e.target.value,
          })
        }
      />
</div>
<div>
      <label>כתובת מגורים</label>
      <input
        type="text"
        value={volunteerForm.address}
        onChange={(e) =>
          setVolunteerForm({
            ...volunteerForm,
            address: e.target.value,
          })
        }
      />
</div>
<div>
      <label>הערות</label>
      <input
        type="text"
        value={volunteerForm.notes}
        onChange={(e) =>
          setVolunteerForm({
            ...volunteerForm,
            notes: e.target.value,
          })
        }
      />
</div>
      <button type="submit">
        שמור נתונים
      </button>
    </form>
  );
}

export default VolunteerForm;