import { useNavigate } from "react-router-dom";
import CommunitySettingsLanguagesSection from "../../components/communityStaff/CommunitySettingsLanguagesSection.jsx";
import CommunitySettingsHelpTypesSection from "../../components/communityStaff/CommunitySettingsHelpTypesSection.jsx";
import CommunityStaffMessage, {
  useCommunityStaffMessage,
} from "../../components/communityStaff/CommunityStaffMessage.jsx";
import "../../styles/communityStaff/CommunityStaffDashboard.css";

function CommunitySettingsPage() {
  const navigate = useNavigate();
  const { message, showSuccess, showError, clearMessage } =
    useCommunityStaffMessage();

  return (
    <div
      className="community-settings-page activities-mgmt-page"
      dir="rtl"
    >
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="activities-mgmt-decoration activities-mgmt-decoration--top"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="activities-mgmt-decoration activities-mgmt-decoration--left"
      />
      <img
        src="/images/minitree.png"
        alt=""
        aria-hidden="true"
        className="activities-mgmt-decoration activities-mgmt-decoration--bottom"
      />

      <div className="staff-container staff-container--activities">
        <header className="activities-mgmt-page__header">
          <div className="activities-mgmt-page__header-main">
            <h1 className="activities-mgmt-page__title">הגדרות קהילה</h1>
            <p className="activities-mgmt-page__subtitle">
              ניהול שפות וסוגי עזרה
            </p>
          </div>
          <div className="activities-mgmt-page__actions">
            <button
              type="button"
              className="staff-back-button"
              onClick={() => navigate("/community-staff")}
            >
              <span className="staff-back-button__icon" aria-hidden="true">
                →
              </span>
              חזרה ללוח הבקרה
            </button>
          </div>
        </header>

        <CommunityStaffMessage message={message} onDismiss={clearMessage} />

        <div className="community-settings-page__sections">
          <CommunitySettingsLanguagesSection
            onShowSuccess={showSuccess}
            onShowError={showError}
          />
          <CommunitySettingsHelpTypesSection
            onShowSuccess={showSuccess}
            onShowError={showError}
          />
        </div>
      </div>
    </div>
  );
}

export default CommunitySettingsPage;
