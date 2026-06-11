import { apiPost } from "./api";

export async function checkParticipantByIdNumber(idNumber) {
  const { response, data } = await apiPost("/check-participant", { idNumber });

  if (!response.ok || !data.success) {
    throw new Error(data.message || "שגיאה בבדיקת תעודת זהות");
  }

  return data;
}
