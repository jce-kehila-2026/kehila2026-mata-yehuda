import CommunityJoinForm from "../components/supportiveCommunity/CommunityJoinForm";
import PublicParticipantLayout from "../layouts/PublicParticipantLayout";
import "../styles/CommunityJoinForm.css";

function CommunityJoinPage() {
  return (
    <PublicParticipantLayout>
      <CommunityJoinForm />
    </PublicParticipantLayout>
  );
}

export default CommunityJoinPage;
