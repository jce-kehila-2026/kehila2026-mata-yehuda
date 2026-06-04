import { useState } from "react";
import CommunityMembershipCheck from "../components/supportiveCommunity/CommunityMembershipCheck";
import ServiceRequestForm from "../components/supportiveCommunity/ServiceRequestForm";
import "../styles/CommunityJoinForm.css";

function ServiceRequestPage() {
  const [verifiedParticipantId, setVerifiedParticipantId] = useState(null);

  return (
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
  );
}

export default ServiceRequestPage;