function PaymentFlowShell({ children }) {
  return (
    <section className="payment-flow-page">
      <div className="payment-flow-shell">
        <div className="payment-flow-shell__content">{children}</div>
      </div>
    </section>
  );
}

export default PaymentFlowShell;
