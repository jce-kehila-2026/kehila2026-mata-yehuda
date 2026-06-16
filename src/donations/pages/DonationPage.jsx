import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import DonationForm from "../components/DonationForm";
import "../styles/donations.css";

function parseInitialAmount(searchParams) {
  const raw = searchParams.get("amount");
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

function DonationPage() {
  const [searchParams] = useSearchParams();
  const initialAmount = useMemo(
    () => parseInitialAmount(searchParams),
    [searchParams]
  );

  return (
    <>
      <header className="community-hero">
        <span className="hero-icon" aria-hidden="true">
          ♥
        </span>
        <h1>תרומות לעמותה</h1>
        <p>כל תרומה — קטנה כגדולה — מחזקת את הקהילה שלנו</p>
      </header>

      <DonationForm initialAmount={initialAmount} showBackToHome />
    </>
  );
}

export default DonationPage;
