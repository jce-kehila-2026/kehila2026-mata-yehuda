import { Link } from "react-router-dom";

function SupportiveCommunityBackNav() {
  return (
    <nav className="community-home-nav" aria-label="ניווט חזרה לקהילה תומכת">
      <div className="community-home-nav-inner">
        <Link className="community-home-nav-link" to="/supportive-community">
          ← חזרה לקהילה תומכת
        </Link>
      </div>
    </nav>
  );
}

export default SupportiveCommunityBackNav;
