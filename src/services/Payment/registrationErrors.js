export const REGISTRATION_NOT_OPEN_MESSAGE = "עדיין לא נפתחה ההרשמה";

export function notifyRegistrationBlock(message, setFormError) {
  if (message === REGISTRATION_NOT_OPEN_MESSAGE) {
    window.alert(message);
  }
  if (setFormError) {
    setFormError(message);
  }
}
