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
    <div className="community-settings-page" dir="rtl">
      <header className="community-settings-page__header community-staff-page-header">
        <div className="community-staff-page-header__main">
          <button
            type="button"
            className="community-settings-page__back"
            onClick={() => navigate("/community-staff")}
          >
            חזרה ללוח הבקרה
          </button>
          <h1 className="community-settings-page__title page-title">הגדרות קהילה</h1>
          <p className="community-staff-page-subtitle">
            ניהול שפות וסוגי עזרה
          </p>
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
  );
}

export default CommunitySettingsPage;
