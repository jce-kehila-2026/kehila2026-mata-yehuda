import { useState } from "react";
import { saveVolunteerData } from "../../services/volunteerService";

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
      alert("Please fill all required fields");
      return;
    }

    try {
  await saveVolunteerData(volunteerForm.volunteerId, volunteerForm);
  alert("Volunteer saved successfully");
} catch (error) {
  console.error("Error saving volunteer:", error);
  alert(error.message);
}
await saveVolunteerData(volunteerForm.volunteerId, volunteerForm);



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
 };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Volunteer Registration</h1>

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

      <label>מין</label>
      <input
        type="text"
        value={volunteerForm.gender}
        onChange={(e) =>
          setVolunteerForm({
            ...volunteerForm,
            gender: e.target.value,
          })
        }
      />

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

      <button type="submit">
        שמור נתונים
      </button>
    </form>
  );
}

export default VolunteerForm;