export const PAYMENT_ERROR_REASONS = {
  USER_CANCELLED: "user_cancelled",
  CAPTURE_FAILED: "capture_failed",
  NO_PAYPAL_TOKEN: "no_paypal_token",
  MISSING_ACTIVITY: "missing_activity",
  CONNECTION_ERROR: "connection_error",
  DUPLICATE_REGISTRATION: "duplicate_registration",
  REGISTRATION_NOT_OPEN: "registration_not_open",
  REGISTRATION_CLOSED: "registration_closed",
  ACTIVITY_FULL: "activity_full",
  ACTIVITY_NOT_FOUND: "activity_not_found",
  PAYMENT_AMOUNT_MISMATCH: "payment_amount_mismatch",
  PAYPAL_SETUP: "paypal_setup",
  VALIDATION: "validation",
  GENERIC: "generic",
};

const ERROR_CONTENT = {
  [PAYMENT_ERROR_REASONS.USER_CANCELLED]: {
    title: "התשלום לא הושלם",
    summary: "ביטלתם את התשלום או חזרתם מדף PayPal לפני סיום.",
    explanation:
      "לא חויבתם ולא נוצרה הרשמה. המקום בפעילות לא שוריין.",
    whatToDo:
      "אם ברצונכם להירשם, ניתן לנסות שוב את התשלום. אם הבעיה נמשכת, פנו לעמותה.",
  },
  [PAYMENT_ERROR_REASONS.CAPTURE_FAILED]: {
    title: "התשלום לא הושלם",
    summary: "התשלום לא אושר במערכת.",
    explanation:
      "ייתכן שהתשלום ב-PayPal לא הסתיים, או שהשרת לא הצליח לשמור את ההרשמה.",
    whatToDo:
      "בדקו אם חויבתם בחשבון PayPal או בכרטיס. אם לא — נסו שוב. אם חויבתם — פנו לעמותה עם פרטי התשלום.",
  },
  [PAYMENT_ERROR_REASONS.NO_PAYPAL_TOKEN]: {
    title: "התשלום לא הושלם",
    summary: "לא התקבל אישור תשלום מ-PayPal.",
    explanation:
      "החזרה מדף התשלום לא הכילה את המידע הנדרש לאישור ההרשמה.",
    whatToDo: "חזרו לדף ההרשמה ונסו שוב את התשלום.",
  },
  [PAYMENT_ERROR_REASONS.MISSING_ACTIVITY]: {
    title: "לא ניתן להמשיך",
    summary: "לא נמצאו פרטי הפעילות לתשלום.",
    explanation:
      "ייתכן שפג תוקף הקישור או שנמחקו נתונים מהדפדפן אחרי מעבר ל-PayPal.",
    whatToDo: "חזרו לדף ההרשמה, בחרו את הפעילות מחדש ונסו שוב.",
  },
  [PAYMENT_ERROR_REASONS.CONNECTION_ERROR]: {
    title: "שגיאה בחיבור",
    summary: "לא הצלחנו להתחבר לשרת התשלום.",
    explanation:
      "ייתכן שהשרת לא פועל, שיש בעיה בחיבור לאינטרנט, או שהבקשה ארכה יותר מדי זמן.",
    whatToDo:
      "ודאו שיש חיבור לאינטרנט ונסו שוב בעוד רגע. אם הבעיה נמשכת — פנו לעמותה.",
  },
  [PAYMENT_ERROR_REASONS.DUPLICATE_REGISTRATION]: {
    title: "כבר נרשמת לפעילות",
    summary: "קיימת הרשמה פעילה שלכם לפעילות הזו.",
    explanation:
      "לא ניתן להירשם פעמיים לאותה פעילות. אם ברצונכם לבטל — השתמשו בביטול הרשמה.",
    whatToDo:
      "לביטול הרשמה קיימת, השתמשו בכפתור «ביטול הרשמה קיימת» בדף ההרשמה.",
  },
  [PAYMENT_ERROR_REASONS.REGISTRATION_NOT_OPEN]: {
    title: "ההרשמה עדיין לא פתוחה",
    summary: "עדיין לא נפתחה ההרשמה לפעילות זו.",
    explanation:
      "הפעילות עדיין לא פתוחה להרשמה במערכת. נסו שוב מאוחר יותר.",
    whatToDo: "עקבו אחר עדכונים מהעמותה או בחרו פעילות אחרת.",
  },
  [PAYMENT_ERROR_REASONS.REGISTRATION_CLOSED]: {
    title: "מועד ההרשמה הסתיים",
    summary: "תאריך ההרשמה לפעילות זו כבר עבר.",
    explanation: "לא ניתן להירשם לפעילות אחרי סגירת מועד ההרשמה.",
    whatToDo: "בחרו פעילות אחרת או פנו לעמותה לבירור.",
  },
  [PAYMENT_ERROR_REASONS.ACTIVITY_FULL]: {
    title: "אין מקומות פנויים",
    summary: "כל המקומים בפעילות זו תפוסים.",
    explanation: "הפעילות הגיעה למספר המשתתפים המקסימלי.",
    whatToDo: "בחרו פעילות אחרת או פנו לעמותה לבירור.",
  },
  [PAYMENT_ERROR_REASONS.ACTIVITY_NOT_FOUND]: {
    title: "הפעילות לא נמצאה",
    summary: "הפעילות שבחרתם לא קיימת או הוסרה.",
    explanation: "ייתכן שהקישור לא מעודכן או שהפעילות בוטלה.",
    whatToDo: "חזרו לרשימת הפעילויות ובחרו פעילות אחרת.",
  },
  [PAYMENT_ERROR_REASONS.PAYMENT_AMOUNT_MISMATCH]: {
    title: "התשלום לא אושר",
    summary: "סכום התשלום לא תואם למחיר הפעילות.",
    explanation:
      "מערכת התשלום זיהתה חוסר התאמה בין הסכום ששולם ומחיר הפעילות.",
    whatToDo: "אל תנסו שוב לשלם. פנו לעמותה עם פרטי התשלום.",
  },
  [PAYMENT_ERROR_REASONS.PAYPAL_SETUP]: {
    title: "לא ניתן לפתוח תשלום",
    summary: "שירות PayPal לא זמין כרגע.",
    explanation:
      "ייתכן שהשרת לא מוגדר כראוי או שיש תקלה זמנית בשירות התשלום.",
    whatToDo:
      "נסו שוב מאוחר יותר, או בחרו אמצעי תשלום אחר (מזומן / Bit) אם זמין.",
  },
  [PAYMENT_ERROR_REASONS.VALIDATION]: {
    title: "פרטים לא תקינים",
    summary: "יש לתקן את הפרטים בטופס.",
    explanation: "אחד או יותר מהשדות לא עברו בדיקה.",
    whatToDo: "עברו על השדות המסומנים ותקנו לפי ההודעה.",
  },
  [PAYMENT_ERROR_REASONS.GENERIC]: {
    title: "התשלום לא הושלם",
    summary: "אירעה שגיאה בתהליך התשלום או ההרשמה.",
    explanation: "לא הצלחנו להשלים את הפעולה.",
    whatToDo: "נסו שוב או פנו לעמותה אם הבעיה נמשכת.",
  },
};

function normalizeText(value) {
  return String(value || "").trim();
}

function detectReasonFromCode(code) {
  const normalized = normalizeText(code).toUpperCase();

  switch (normalized) {
    case "DUPLICATE_REGISTRATION":
      return PAYMENT_ERROR_REASONS.DUPLICATE_REGISTRATION;
    case "REGISTRATION_NOT_OPEN":
      return PAYMENT_ERROR_REASONS.REGISTRATION_NOT_OPEN;
    case "REGISTRATION_CLOSED":
      return PAYMENT_ERROR_REASONS.REGISTRATION_CLOSED;
    case "ACTIVITY_FULL":
      return PAYMENT_ERROR_REASONS.ACTIVITY_FULL;
    case "PAYMENT_AMOUNT_MISMATCH":
    case "PAYMENT_CURRENCY_MISMATCH":
      return PAYMENT_ERROR_REASONS.PAYMENT_AMOUNT_MISMATCH;
    default:
      return null;
  }
}

function detectReasonFromMessage(message) {
  const text = normalizeText(message);
  if (!text) {
    return null;
  }

  const lower = text.toLowerCase();

  if (text.includes("כבר נרשמת")) {
    return PAYMENT_ERROR_REASONS.DUPLICATE_REGISTRATION;
  }
  if (text.includes("עדיין לא נפתחה ההרשמה")) {
    return PAYMENT_ERROR_REASONS.REGISTRATION_NOT_OPEN;
  }
  if (text.includes("ההרשמה לפעילות זו הסתיים") || text.includes("מועד ההרשמה")) {
    return PAYMENT_ERROR_REASONS.REGISTRATION_CLOSED;
  }
  if (text.includes("אין מקומות פנויים")) {
    return PAYMENT_ERROR_REASONS.ACTIVITY_FULL;
  }
  if (text.includes("לא נמצאה") || text.includes("לא נמצאו פרטי הפעילות")) {
    return PAYMENT_ERROR_REASONS.MISSING_ACTIVITY;
  }
  if (text.includes("לא התקבל אישור תשלום")) {
    return PAYMENT_ERROR_REASONS.NO_PAYPAL_TOKEN;
  }
  if (
    lower.includes("חיבור לשרת") ||
    lower.includes("timeout") ||
    text.includes("ארכה יותר מדי") ||
    text.includes("לא ניתן להתחבר")
  ) {
    return PAYMENT_ERROR_REASONS.CONNECTION_ERROR;
  }
  if (text.includes("PayPal") && (text.includes(".env") || text.includes("לא ניתן לפתוח"))) {
    return PAYMENT_ERROR_REASONS.PAYPAL_SETUP;
  }
  if (text.includes("סכום התשלום לא תואם")) {
    return PAYMENT_ERROR_REASONS.PAYMENT_AMOUNT_MISMATCH;
  }
  if (text.includes("תעודת זהות") || text.includes("טלפון") || text.includes("שם פרטי")) {
    return PAYMENT_ERROR_REASONS.VALIDATION;
  }

  return null;
}

/**
 * Maps API / UI errors to structured Hebrew content for the failure screen.
 */
export function resolvePaymentError({ message, code, reason } = {}) {
  const detectedReason =
    reason ||
    detectReasonFromCode(code) ||
    detectReasonFromMessage(message) ||
    PAYMENT_ERROR_REASONS.GENERIC;

  const content =
    ERROR_CONTENT[detectedReason] ||
    ERROR_CONTENT[PAYMENT_ERROR_REASONS.GENERIC];

  return {
    reason: detectedReason,
    title: content.title,
    summary: content.summary,
    explanation: content.explanation,
    whatToDo: content.whatToDo,
    rawMessage: normalizeText(message) || null,
  };
}
