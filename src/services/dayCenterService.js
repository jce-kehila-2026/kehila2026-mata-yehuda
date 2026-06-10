import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function registerToDayCenter(formData) {
  const participantDoc = await addDoc(collection(db, "participants"), {
    first_name: formData.firstName,
    last_name: formData.lastName,
    id_number: formData.idNumber,
    phone: formData.phone,
  });

  await addDoc(collection(db, "registrations"), {
    participant_id: participantDoc.id,
    program_id: "day_center",
    registration_status: "ממתין",
    registered_at: serverTimestamp(),
  });
}