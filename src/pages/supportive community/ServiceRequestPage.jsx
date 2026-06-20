import { useEffect, useState } from "react";
import CommunityMembershipCheck from "../../components/supportiveCommunity/CommunityMembershipCheck";
import ServiceRequestForm from "../../components/supportiveCommunity/ServiceRequestForm";
import SupportiveCommunityBackNav from "../../components/supportiveCommunity/SupportiveCommunityBackNav";import { syncActiveCommunitySubscriptionsToHomeHelpRequests } from "../../services/supportive community/supportiveCommunityService";
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
    <div className="supportive-community-page" dir="rtl">
      <SupportiveCommunityBackNav />

      <section className="community-hero">
        <h1>בקשת שירות נוסף</h1>
        <p>
          השירות מיועד לחברי קהילה תומכת בלבד. לאחר בדיקת החברות ניתן להגיש בקשה.
        </p>
      </section>

      {!verifiedMember ? (
        <CommunityMembershipCheck onVerified={setVerifiedMember} />
      ) : (
        <ServiceRequestForm
          participantDocId={verifiedMember.participantDocId}
          subscriptionDocId={verifiedMember.subscriptionDocId}
        />
      )}
    </div>
  );
}

export default ServiceRequestPage;
