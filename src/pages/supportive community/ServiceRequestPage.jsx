import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommunityMembershipCheck from "../../components/supportiveCommunity/CommunityMembershipCheck";
import ServiceRequestForm from "../../components/supportiveCommunity/ServiceRequestForm";
import { syncActiveCommunitySubscriptionsToHomeHelpRequests } from "../../services/supportive community/supportiveCommunityService";
import "../../styles/supportive community/SupportiveCommunityPage.css";
import "../../styles/supportive community/CommunityJoinForm.css";

function ServiceRequestPage() {
  const [verifiedMember, setVerifiedMember] = useState(null);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return undefined;
    }

    window.syncActiveCommunitySubscriptions = async () => {
      return syncActiveCommunitySubscriptionsToHomeHelpRequests();
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get("syncSubscriptions") === "1") {
      syncActiveCommunitySubscriptionsToHomeHelpRequests();
    }

    return () => {
      delete window.syncActiveCommunitySubscriptions;
    };
  }, []);

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
            <h1 className="list-mgmt-page__title">בקשת שירות נוסף</h1>
            <p className="list-mgmt-page__subtitle">
              השירות מיועד לחברי קהילה תומכת בלבד. לאחר בדיקת החברות ניתן להגיש
              בקשה.
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

        {!verifiedMember ? (
          <CommunityMembershipCheck onVerified={setVerifiedMember} />
        ) : (
          <ServiceRequestForm
            participantDocId={verifiedMember.participantDocId}
            subscriptionDocId={verifiedMember.subscriptionDocId}
          />
        )}
      </div>
    </div>
  );
}

export default ServiceRequestPage;
