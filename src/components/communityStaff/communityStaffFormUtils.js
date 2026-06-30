import { buildSubscriptionFormValues } from "./CommunityStaffSubscriptionFormFields.jsx";
import {
  INVALID_ADDRESS_MESSAGE,
  isValidAddress,
  nameContainsNumber,
} from "../../utils/nameValidation";

export const EMERGENCY_NUMBER_ERROR =
  "מספר חירום חייב להיות מספר טלפון נייד תקין המתחיל ב-05 ומכיל 10 ספרות";

export function getEmergencyNumberError(value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return "נא למלא מספר טלפון לאיש קשר לחירום";
  }

  if (!/^05\d{8}$/.test(trimmedValue)) {
    return EMERGENCY_NUMBER_ERROR;
  }

  return "";
}

export function validateCommunityMemberParticipantForm(form) {
  if (!form.first_name.trim()) {
    return "נא למלא שם פרטי";
  }

  if (nameContainsNumber(form.first_name)) {
    return "שם פרטי אינו יכול להכיל מספרים";
  }

  if (!form.last_name.trim()) {
    return "נא למלא שם משפחה";
  }

  if (nameContainsNumber(form.last_name)) {
    return "שם משפחה אינו יכול להכיל מספרים";
  }

  if (!form.id_number.trim()) {
    return "נא למלא מספר תעודת זהות";
  }

  if (!/^\d{9}$/.test(form.id_number.trim())) {
    return "מספר תעודת זהות חייב להיות בן 9 ספרות";
  }

  if (!form.phone.trim()) {
    return "נא למלא מספר טלפון";
  }

  if (!/^0\d{8,9}$/.test(form.phone.trim())) {
    return "מספר הטלפון חייב להתחיל ב-0 ולהכיל 9 או 10 ספרות";
  }

  if (!form.birth_date) {
    return "נא למלא תאריך לידה";
  }

  if (!form.gender) {
    return "נא לבחור מין";
  }

  if (!form.address.trim()) {
    return "נא למלא כתובת";
  }

  if (!isValidAddress(form.address)) {
    return INVALID_ADDRESS_MESSAGE;
  }

  const emergencyNumberError = getEmergencyNumberError(form.emergency_number);

  if (emergencyNumberError) {
    return emergencyNumberError;
  }

  return "";
}

export function buildMemberMedicalNotes(form) {
  const parts = [];

  if (form.emergency_contact_name?.trim()) {
    parts.push(`איש קשר לחירום: ${form.emergency_contact_name.trim()}`);
  }

  if (form.medical_notes?.trim()) {
    parts.push(form.medical_notes.trim());
  }

  return parts.join("\n");
}

export function splitCommunityMemberFormData(form) {
  return {
    participantData: {
      first_name: form.first_name,
      last_name: form.last_name,
      id_number: form.id_number,
      phone: form.phone,
      birth_date: form.birth_date,
      gender: form.gender,
      address: form.address,
      emergency_number: form.emergency_number,
      medical_notes: buildMemberMedicalNotes(form),
      mobility_limitations: "",
      marketing_consent: Boolean(form.marketing_consent),
    },
    subscriptionData: {
      monthlyPrice: form.monthlyPrice,
      requestedServices: form.requestedServices,
      languages: form.languages,
      otherService: form.otherService,
    },
  };
}

export function buildEmptyCommunityMemberForm() {
  return {
    first_name: "",
    last_name: "",
    id_number: "",
    phone: "",
    birth_date: "",
    gender: "",
    address: "",
    emergency_contact_name: "",
    emergency_number: "",
    medical_notes: "",
    marketing_consent: false,
    ...buildSubscriptionFormValues({}),
  };
}

export function validateCreateVolunteerForm(form) {
  if (!form.id_number.trim()) {
    return "נא למלא מספר תעודת זהות";
  }

  if (!/^\d{9}$/.test(form.id_number.trim())) {
    return "מספר תעודת זהות חייב להיות בן 9 ספרות";
  }

  if (!form.first_name.trim()) {
    return "נא למלא שם פרטי";
  }

  if (nameContainsNumber(form.first_name)) {
    return "שם פרטי אינו יכול להכיל מספרים";
  }

  if (!form.last_name.trim()) {
    return "נא למלא שם משפחה";
  }

  if (nameContainsNumber(form.last_name)) {
    return "שם משפחה אינו יכול להכיל מספרים";
  }

  if (!form.phone.trim()) {
    return "נא למלא מספר טלפון";
  }

  if (!/^0\d{8,9}$/.test(form.phone.trim())) {
    return "מספר הטלפון חייב להתחיל ב-0 ולהכיל 9 או 10 ספרות";
  }

  if (!Array.isArray(form.languages) || form.languages.length === 0) {
    return "נא לבחור לפחות שפה אחת";
  }

  if (!Array.isArray(form.help_types) || form.help_types.length === 0) {
    return "נא לבחור לפחות סוג עזרה אחד";
  }

  return "";
}

export function buildEmptyVolunteerForm() {
  return {
    id_number: "",
    first_name: "",
    last_name: "",
    phone: "",
    gender: "",
    address: "",
    languages: [],
    help_types: [],
    notes: "",
  };
}

export function toggleArrayValue(values, value) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}
