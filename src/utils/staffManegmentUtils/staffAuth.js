import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "../../config/firebase";

export async function verifyActiveStaffUser(user) {
  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const staffSnap = await getDocFromServer(doc(db, "staff", user.uid));

  if (!staffSnap.exists()) {
    return { ok: false, reason: "not_staff" };
  }

  const staffData = staffSnap.data();

  if (!staffData.is_active) {
    return { ok: false, reason: "inactive" };
  }

  return { ok: true, staff: staffData };
}
