import { useNavigate } from "react-router-dom";
import PaymentFailureScreen from "../../components/Payment/PaymentFailureScreen";
import { PAYMENT_ERROR_REASONS } from "../../services/Payment/paymentErrorMessages";
import { getStoredRegistrationPaymentPath } from "../../services/Payment/paymentLink";

function PaymentCancel() {
  const navigate = useNavigate();

  const retryPayment = () => {
    navigate(getStoredRegistrationPaymentPath());
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <PaymentFailureScreen
      reason={PAYMENT_ERROR_REASONS.USER_CANCELLED}
      icon="✕"
      onRetry={retryPayment}
      onGoHome={goHome}
      showRawMessage={false}
    />
  );
}

export default PaymentCancel;
