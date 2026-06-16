import { useNavigate } from "react-router-dom";

function DonationCancelPage() {
  const navigate = useNavigate();

  return (
    <>
      <header className="community-hero">
        <span className="hero-icon" aria-hidden="true">
          !
        </span>
        <h1>התרומה בוטלה</h1>
        <p>לא בוצע תשלום. ניתן לנסות שוב בכל עת.</p>
      </header>

      <section className="community-section donation-flow">
        <div className="community-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate("/donations")}
          >
            חזרה לתרומות
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/")}
          >
            חזרה למסך הראשי
          </button>
        </div>
      </section>
    </>
  );
}

export default DonationCancelPage;
