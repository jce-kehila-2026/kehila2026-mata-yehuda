export function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

export function validateIsraeliPhone(phone) {
  const digits = normalizePhone(phone);

  if (!digits) {
    return { valid: false, message: "אנא הזינו מספר טלפון" };
  }

  if (!digits.startsWith("05")) {
    return {
      valid: false,
      message: "מספר הטלפון חייב להתחיל ב-05. אנא תקנו את המספר.",
    };
  }

  if (digits.length !== 10) {
    return {
      valid: false,
      message: "מספר הטלפון חייב להיות בן 10 ספרות. אנא תקנו את המספר.",
    };
  }

  return { valid: true, phone: digits };
}

export function validateName(name, fieldLabel) {
  const trimmed = name.trim();

  if (!trimmed) {
    return {
      valid: false,
      message: `אנא הזינו ${fieldLabel}`,
    };
  }

  const lettersOnly = /^[\u0590-\u05FFa-zA-Z]+(?:[\s'-][\u0590-\u05FFa-zA-Z]+)*$/;

  if (!lettersOnly.test(trimmed)) {
    return {
      valid: false,
      message: `${fieldLabel} חייב להכיל אותיות בלבד (ללא מספרים או סימנים). אנא תקנו.`,
    };
  }

  if (trimmed.length < 2) {
    return {
      valid: false,
      message: `${fieldLabel} קצר מדי. אנא הזינו לפחות 2 אותיות.`,
    };
  }

  return { valid: true, name: trimmed };
}

export function normalizeIdNumber(idNumber) {
  return idNumber.replace(/\D/g, "");
}

export function validateIsraeliId(idNumber) {
  const digits = normalizeIdNumber(idNumber);

  if (!digits) {
    return { valid: false, message: "אנא הזינו מספר תעודת זהות" };
  }

  if (!/^\d+$/.test(digits)) {
    return {
      valid: false,
      message: "מספר תעודת זהות חייב להכיל ספרות בלבד. אנא תקנו.",
    };
  }

  if (digits.length !== 9) {
    return {
      valid: false,
      message: "מספר תעודת זהות חייב להיות בן 9 ספרות. אנא תקנו.",
    };
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let num = Number(digits[i]) * ((i % 2) + 1);
    if (num > 9) {
      num -= 9;
    }
    sum += num;
  }

  if (sum % 10 !== 0) {
    return {
      valid: false,
      message: "מספר תעודת זהות לא תקין. אנא בדקו ותקנו.",
    };
  }

  return { valid: true, idNumber: digits };
}

export function validateRegistrationDetails(formData) {
  const firstName = validateName(formData.firstName, "שם פרטי");
  if (!firstName.valid) {
    return firstName;
  }

  const idNumber = validateIsraeliId(formData.idNumber);
  if (!idNumber.valid) {
    return idNumber;
  }

  const phone = validateIsraeliPhone(formData.phone);
  if (!phone.valid) {
    return phone;
  }

  return {
    valid: true,
    firstName: firstName.name,
    idNumber: idNumber.idNumber,
    phone: phone.phone,
  };
}

export function validateRegistrationForm(formData) {
  const details = validateRegistrationDetails(formData);
  if (!details.valid) {
    return details;
  }

  if (!formData.paymentMethod) {
    return {
      valid: false,
      message: "אנא בחרו שיטת תשלום",
    };
  }

  return {
    valid: true,
    firstName: details.firstName,
    idNumber: details.idNumber,
    phone: details.phone,
  };
}
