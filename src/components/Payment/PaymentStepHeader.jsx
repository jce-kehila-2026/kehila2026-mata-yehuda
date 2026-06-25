const TITLE_LEAF = "/images/minitree.png";

function PaymentStepHeader({ title, hint, showLeafDecoration = false }) {
  return (
    <header className="payment-step-header">
      <div
        className={[
          "payment-step-header__title-row",
          !showLeafDecoration && "payment-step-header__title-row--plain",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {showLeafDecoration ? (
          <>
            <div className="payment-step-header__ornament" aria-hidden="true">
              <span className="payment-step-header__line" />
              <img className="payment-step-header__sprig" src={TITLE_LEAF} alt="" />
            </div>
            <h2 className="payment-step-header__title">{title}</h2>
            <div className="payment-step-header__ornament" aria-hidden="true">
              <img
                className="payment-step-header__sprig payment-step-header__sprig--flipped"
                src={TITLE_LEAF}
                alt=""
              />
              <span className="payment-step-header__line" />
            </div>
          </>
        ) : (
          <h2 className="payment-step-header__title">{title}</h2>
        )}
      </div>
      {hint && <p className="payment-step-header__hint">{hint}</p>}
    </header>
  );
}

export default PaymentStepHeader;
