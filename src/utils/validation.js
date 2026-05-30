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

export function validateRegistrationForm(formData) {
  const firstName = validateName(formData.firstName, "שם פרטי");
  if (!firstName.valid) {
    return firstName;
  }

  const lastName = validateName(formData.lastName, "שם משפחה");
  if (!lastName.valid) {
    return lastName;
  }

  const phone = validateIsraeliPhone(formData.phone);
  if (!phone.valid) {
    return phone;
  }

  if (!formData.paymentMethod) {
    return {
      valid: false,
      message: "אנא בחרו שיטת תשלום",
    };
  }

  return {
    valid: true,
    firstName: firstName.name,
    lastName: lastName.name,
    phone: phone.phone,
  };
}
