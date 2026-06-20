function toMillis(value) {
  if (!value) return 0;

  let date;
  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }

  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** ממתינות: הישנות קודם (FIFO) */
export function sortWaitingRequests(requests) {
  return [...requests].sort((a, b) => toMillis(a.date) - toMillis(b.date));
}

/** נענו: האחרונות שנענו קודם */
export function sortAnsweredRequests(requests) {
  return [...requests].sort(
    (a, b) => toMillis(b.answeredAt) - toMillis(a.answeredAt),
  );
}

export function formatDisplayDate(value) {
  if (!value) return "—";

  let date;
  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function getPhoneDigits(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

/** מספר נייד שיכול להיות רשום בוואטסאפ (למשל 05X, לא קו קווי) */
export function isWhatsAppCapablePhone(phone) {
  const digits = getPhoneDigits(phone);

  if (!digits) return false;

  if (digits.length === 10 && digits.startsWith("05")) {
    return true;
  }

  if (digits.length === 12 && digits.startsWith("9725")) {
    return true;
  }

  if (digits.length >= 11 && digits.length <= 15 && digits.startsWith("972")) {
    return digits.startsWith("9725");
  }

  if (digits.length >= 10 && digits.length <= 15 && !digits.startsWith("972")) {
    return true;
  }

  return false;
}

export function formatPhoneForDisplay(phone) {
  const digits = getPhoneDigits(phone);

  if (digits.length === 12 && digits.startsWith("972")) {
    return `0${digits.slice(3)}`;
  }

  return String(phone ?? "").trim() || "—";
}

export function normalizePhoneForWhatsApp(phone) {
  const digits = getPhoneDigits(phone);

  if (!digits || !isWhatsAppCapablePhone(phone)) return "";

  if (digits.startsWith("0")) {
    return `972${digits.slice(1)}`;
  }

  return digits;
}

export function buildTelUrl(phone) {
  const digits = getPhoneDigits(phone);

  if (!digits) return null;

  if (digits.startsWith("0")) {
    return `tel:${digits}`;
  }

  if (digits.startsWith("972")) {
    return `tel:+${digits}`;
  }

  return `tel:+${digits}`;
}

export function buildWhatsAppUrl(phone, message) {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;

  const encodedMessage = encodeURIComponent(String(message ?? ""));
  return `https://api.whatsapp.com/send?phone=${normalized}&text=${encodedMessage}`;
}

export async function openWhatsAppChat(phone, message) {
  const url = buildWhatsAppUrl(phone, message);
  if (!url) return { ok: false, reason: "invalid_phone" };

  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(String(message ?? ""));
      copied = true;
    }
  } catch {
    copied = false;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { ok: true, copied };
}

export const ORGANIZATION_NAME = "עמותת ותיקי מטה יהודה";

export function buildStaffWhatsAppMessage({ answer, content, date }) {
  const trimmedAnswer = String(answer ?? "").trim();
  const trimmedContent = String(content ?? "").trim() || "—";
  const requestDate = formatDisplayDate(date);

  return [
    "שלום,",
    `תודה שפנית אל ${ORGANIZATION_NAME}.`,
    `פנייתך התקבלה בתאריך ${requestDate}.`,
    "תוכן הפנייה:",
    trimmedContent,
    "מענה:",
    trimmedAnswer,
    "בברכה,",
    `${ORGANIZATION_NAME}.`,
  ].join("\n");
}
