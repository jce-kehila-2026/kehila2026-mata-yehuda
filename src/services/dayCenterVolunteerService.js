import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function registerVolunteer(formData) {
  await addDoc(collection(db, "daycenterVolunteers"), {
    first_name: formData.firstName,
    last_name: formData.lastName,
    id_number: formData.idNumber,
    phone: formData.phone,
  });
}