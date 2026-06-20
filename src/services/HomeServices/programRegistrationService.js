import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function registerToProgram(formData, program) {
  const participantDoc = await addDoc(collection(db, "participants"), {
    first_name: formData.firstName,
    last_name: formData.lastName,
    id_number: formData.idNumber,
    phone: formData.phone,
  });

  await addDoc(collection(db, "registrations"), {
    participant_id: participantDoc.id,
    program_id: program.id,
    program_name: program.title,
    registered_at: serverTimestamp(),
  });
}