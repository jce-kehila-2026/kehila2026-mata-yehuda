import { Link } from "react-router-dom";
import VolunteerRegistrationForm from "../../components/volunteer supportive community/VolunteerRegistrationForm";
import "../../styles/supportive community/SupportiveCommunityPage.css";
import "../../styles/supportive community/CommunityJoinForm.css";

function VolunteerRegistrationPage() {
  return (
    <div className="community-join-staff-page list-mgmt-page" dir="rtl">
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--top"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="list-mgmt-decoration list-mgmt-decoration--bottom"
      />

      <div className="staff-container">
        <header className="list-mgmt-page__header">
          <div className="list-mgmt-page__header-main">
            <h1 className="list-mgmt-page__title">התנדבות בקהילה תומכת</h1>
            <p className="list-mgmt-page__subtitle">
              מלאו את הפרטים וצוות העמותה יצור איתכם קשר לאחר בדיקת הבקשה.
            </p>
          </div>
          <div className="list-mgmt-page__actions">
            <Link to="/supportive-community" className="staff-back-button">
              <span className="staff-back-button__icon" aria-hidden="true">
                →
              </span>
              חזרה לקהילה תומכת
            </Link>
          </div>
        </header>

        <VolunteerRegistrationForm />
      </div>
    </div>
  );
}

export default VolunteerRegistrationPage;
