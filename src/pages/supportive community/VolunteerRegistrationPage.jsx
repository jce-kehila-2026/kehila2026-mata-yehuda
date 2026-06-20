import VolunteerRegistrationForm from "../../components/volunteer supportive community/VolunteerRegistrationForm";
import SupportiveCommunityBackNav from "../../components/supportiveCommunity/SupportiveCommunityBackNav";
import "../../styles/supportive community/SupportiveCommunityPage.css";
import "../../styles/supportive community/CommunityJoinForm.css";

function VolunteerRegistrationPage() {
  return (
    <div className="supportive-community-page" dir="rtl">
      <SupportiveCommunityBackNav />

      <section className="community-hero">
        <h1>התנדבות בקהילה תומכת</h1>
        <p>מלאו את הפרטים וצוות העמותה יצור איתכם קשר לאחר בדיקת הבקשה.</p>
      </section>

      <VolunteerRegistrationForm />
    </div>
  );
}

export default VolunteerRegistrationPage;
