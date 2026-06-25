export const REGISTRATION_STEPS = [
  { id: "id-check", label: "ת.ז." },
  { id: "details", label: "פרטים אישיים" },
  { id: "payment-method", label: "אמצעי תשלום" },
  { id: "payment", label: "תשלום" },
  { id: "success", label: "סיום" },
];

function RegistrationStepper({
  currentStep,
  steps = REGISTRATION_STEPS,
  ariaLabel = "התקדמות הרשמה",
}) {
  const totalSteps = steps.length;

  return (
    <nav className="registration-stepper" aria-label={ariaLabel}>
      <ol className="registration-stepper__list">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete =
            stepNumber < currentStep ||
            (currentStep === totalSteps && stepNumber === totalSteps);
          const isCurrent =
            stepNumber === currentStep && currentStep < totalSteps;

          return (
            <li
              key={step.id}
              className={[
                "registration-stepper__item",
                isComplete && "registration-stepper__item--complete",
                isCurrent && "registration-stepper__item--current",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="registration-stepper__marker">
                {isComplete ? (
                  <span className="registration-stepper__check" aria-hidden="true">
                    ✓
                  </span>
                ) : (
                  stepNumber
                )}
              </span>
              <span className="registration-stepper__label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default RegistrationStepper;
