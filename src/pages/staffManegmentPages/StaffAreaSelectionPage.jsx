import { useNavigate } from "react-router-dom";
import { ClipboardList, HeartHandshake } from "lucide-react";

const AREA_OPTIONS = [
  {
    id: "general",
    label: "ניהול כללי",
    description: "פעילויות, משתתפים, בקשות, התראות וניהול שוטף",
    route: "/staff/dashboard",
    icon: ClipboardList,
  },
  {
    id: "community",
    label: "קהילה תומכת",
    description: "חברי קהילה, מתנדבים, התאמות ובקשות סיוע",
    route: "/community-staff",
    icon: HeartHandshake,
  },
];

function StaffAreaSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="staff-login-page staff-area-selection-page">
      <div className="staff-login-card staff-area-selection-card">
        <header className="staff-login-header">
          <p className="staff-login-header__brand">
            {["קהילה מטה ", "יהודה"].join("")}
          </p>
          <h1 className="staff-login-header__title">בחירת אזור ניהול</h1>
          <p className="staff-login-header__subtitle">
            נא לבחור את אזור הניהול הרצוי
          </p>
        </header>

        <div className="staff-area-selection-body">
          <div className="staff-area-selection-options">
            {AREA_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  type="button"
                  className="staff-area-selection-option"
                  onClick={() => navigate(option.route)}
                >
                  <span
                    className="staff-area-selection-option__icon"
                    aria-hidden="true"
                  >
                    <Icon strokeWidth={1.75} />
                  </span>
                  <span className="staff-area-selection-option__content">
                    <span className="staff-area-selection-option__label">
                      {option.label}
                    </span>
                    <span className="staff-area-selection-option__description">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffAreaSelectionPage;
