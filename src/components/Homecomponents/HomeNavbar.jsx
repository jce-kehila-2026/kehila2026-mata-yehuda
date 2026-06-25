import { useLocation, useNavigate } from "react-router-dom";
import { scrollToHomeSection } from "../../utils/homeSectionScroll";

const NAV_ITEMS = [
  { id: "about", label: "מי אנחנו", type: "page", path: "/about" },
  { id: "requests", label: "פניות ובקשות", type: "section" },
  { id: "donations", label: "תרומות", type: "section" },
  { id: "contact", label: "יצירת קשר", type: "section" },
];

function HomeNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (item) => {
    if (item.type === "page") {
      navigate(item.path);
      return;
    }

    if (location.pathname === "/") {
      scrollToHomeSection(item.id);
      return;
    }

    navigate(`/#${item.id}`);
  };

  const handleBrandClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="home-navbar">
      <div className="home-navbar__inner">
        <button
          type="button"
          className="home-navbar__brand"
          onClick={handleBrandClick}
          aria-label="חזרה לראש העמוד"
        >
          <img src="/images/logo.png" alt="לוגו העמותה" className="home-navbar__logo" />
          <span className="home-navbar__title">ותיקי מטה יהודה</span>
        </button>

        <nav className="home-navbar__nav" aria-label="ניווט ראשי">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="home-navbar__link"
              onClick={() => handleNavClick(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="home-navbar__actions">
          <button
            type="button"
            className="home-navbar__login"
            onClick={() => navigate("/staff-login")}
          >
            התחברות
          </button>

        </div>
      </div>
    </header>
  );
}

export default HomeNavbar;
