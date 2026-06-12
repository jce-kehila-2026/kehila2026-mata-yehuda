import { resolvePaymentError } from "../../services/Payment/paymentErrorMessages";

function PaymentFailureScreen({
  message,
  code,
  reason,
  variant = "page",
  icon = "!",
  onRetry,
  onGoHome,
  retryLabel = "נסו שוב את התשלום",
  homeLabel = "חזרה למסך הראשי",
  showActions = true,
  showRawMessage = true,
}) {
  const errorContent = resolvePaymentError({ message, code, reason });
  const showRetry = Boolean(onRetry);
  const showHome = Boolean(onGoHome);

  if (variant === "inline") {
    return (
      <div className="payment-failure-inline" role="alert">
        <p className="payment-failure-inline__title">{errorContent.title}</p>
        <p className="payment-failure-inline__summary">{errorContent.summary}</p>
        <p className="payment-failure-inline__text">{errorContent.explanation}</p>
        <p className="payment-failure-inline__action">{errorContent.whatToDo}</p>
        {showRawMessage && errorContent.rawMessage && (
          <p className="payment-failure-inline__raw" dir="auto">
            {errorContent.rawMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <header className="community-hero payment-failure-hero">
        <span className="hero-icon" aria-hidden="true">{icon}</span>
        <h1>{errorContent.title}</h1>
        <p>{errorContent.summary}</p>
      </header>

      <section className="community-section payment-failure-section">
        <div className="payment-failure-card" role="alert">
          <h2 className="payment-failure-card__heading">מה קרה?</h2>
          <p>{errorContent.explanation}</p>

          <h2 className="payment-failure-card__heading">מה לעשות עכשיו?</h2>
          <p>{errorContent.whatToDo}</p>

          {showRawMessage && errorContent.rawMessage && (
            <p className="payment-failure-card__raw" dir="auto">
              <strong>פרטים טכניים:</strong> {errorContent.rawMessage}
            </p>
          )}
        </div>

        {showActions && (showRetry || showHome) && (
          <div className="community-actions">
            {showRetry && (
              <button type="button" className="primary-btn" onClick={onRetry}>
                {retryLabel}
              </button>
            )}
            {showHome && (
              <button type="button" className="secondary-btn" onClick={onGoHome}>
                {homeLabel}
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}

export default PaymentFailureScreen;
