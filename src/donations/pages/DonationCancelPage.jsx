import { useNavigate } from "react-router-dom";
import PaymentFlowActions from "../../components/Payment/PaymentFlowActions";
import PaymentFlowShell from "../../components/Payment/PaymentFlowShell";
import PaymentStepHeader from "../../components/Payment/PaymentStepHeader";
import RegistrationStepper from "../../components/Payment/RegistrationStepper";
import { DONATION_FLOW_STEPS } from "../config/donations";

function DonationCancelPage() {
  const navigate = useNavigate();

  return (
    <PaymentFlowShell>
      <RegistrationStepper
        currentStep={2}
        steps={DONATION_FLOW_STEPS}
        ariaLabel="התקדמות תרומה"
      />
      <PaymentStepHeader
        title="התרומה בוטלה"
        hint="לא בוצע תשלום. ניתן לנסות שוב בכל עת."
      />
      <PaymentFlowActions split>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/")}
        >
          חזרה למסך הראשי
        </button>
        <button
          type="button"
          className="primary-btn payment-flow-btn"
          onClick={() => navigate("/donations")}
        >
          חזרה לתרומות
          <span className="payment-flow-btn__chevron" aria-hidden="true">
            ‹
          </span>
        </button>
      </PaymentFlowActions>
    </PaymentFlowShell>
  );
}

export default DonationCancelPage;
