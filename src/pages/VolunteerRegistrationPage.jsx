import VolunteerRegistrationForm from "../components/volunteer/VolunteerRegistrationForm";
import PublicParticipantLayout from "../layouts/PublicParticipantLayout";
import "../styles/SupportiveCommunityPage.css";
import "../styles/CommunityJoinForm.css";

function VolunteerRegistrationPage() {
  return (
    <PublicParticipantLayout>
    <div className="supportive-community-page" dir="rtl">
      <section className="community-hero">
        <h1>התנדבות בקהילה תומכת</h1>
        <p>מלאו את הפרטים וצוות העמותה יצור איתכם קשר לאחר בדיקת הבקשה.</p>
      </section>

      <VolunteerRegistrationForm />
    </div>
    </PublicParticipantLayout>
  );
}

export default VolunteerRegistrationPage;