export const REGISTRATION_NOT_OPEN_MESSAGE = "עדיין לא נפתחה ההרשמה";

export function notifyRegistrationBlock(message, setFormError) {
  if (setFormError) {
    setFormError(message);
  }
}
