import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToHomeSection } from "../../utils/homeSectionScroll";

const HOME_SECTION_IDS = ["requests", "donations", "contact"];

const NAV_ITEMS = [
  { id: "about", label: "מי אנחנו", type: "page", path: "/about" },
  { id: "requests", label: "פניות ובקשות", type: "section" },
  { id: "donations", label: "תרומות", type: "section" },
  { id: "contact", label: "יצירת קשר", type: "section" },
];

function HomeNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const hash = location.hash.replace("#", "");
    if (HOME_SECTION_IDS.includes(hash)) {
      setActiveSection(hash);
    }
  }, [location.pathname, location.hash]);

  const handleNavClick = (item) => {
    if (item.type === "page") {
      setActiveSection("");
      navigate(item.path);
      return;
    }

    setActiveSection(item.id);

    if (location.pathname === "/") {
      scrollToHomeSection(item.id);
      return;
    }

    navigate({ pathname: "/", hash: item.id });
  };

  const handleBrandClick = () => {
    setActiveSection("");

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
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.type === "page"
                ? location.pathname === item.path
                : location.pathname === "/" && activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`home-navbar__link${
                  isActive ? " home-navbar__link--active" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleNavClick(item)}
              >
                {item.label}
              </button>
            );
          })}
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
