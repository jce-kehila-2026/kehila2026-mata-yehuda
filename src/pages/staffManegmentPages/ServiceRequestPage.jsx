import { useState } from "react";
import CommunityMembershipCheck from "../../components/supportiveCommunity/CommunityMembershipCheck";
import ServiceRequestForm from "../../components/supportiveCommunity/ServiceRequestForm";
import PublicParticipantLayout from "../../layouts/PublicParticipantLayout";
import "../../styles/staffManegmentStyles/CommunityJoinForm.css";

function ServiceRequestPage() {
  const [verifiedParticipantId, setVerifiedParticipantId] = useState(null);

  return (
    <PublicParticipantLayout>
    <div className="supportive-community-page" dir="rtl">
      <section className="community-hero">
        <h1>בקשת שירות נוסף</h1>
        <p>
          השירות מיועד לחברי קהילה תומכת בלבד. לאחר בדיקת החברות ניתן להגיש בקשה.
        </p>
      </section>

      {!verifiedParticipantId ? (
        <CommunityMembershipCheck
          onVerified={setVerifiedParticipantId}
        />
      ) : (
        <ServiceRequestForm
          participantDocId={verifiedParticipantId}
        />
      )}
    </div>
    </PublicParticipantLayout>
  );
}

export default ServiceRequestPage;