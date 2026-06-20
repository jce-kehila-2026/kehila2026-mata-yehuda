import {
  AdminTableActions,
  AdminTableEditButton,
} from "../admin/AdminTableActions.jsx";
import { CommunityStaffActiveBadge } from "./CommunityStaffListUi.jsx";

function CommunitySettingsItemCard({
  title,
  subtitle,
  isActive,
  onEdit,
  onToggleActive,
  toggling = false,
}) {
  return (
    <li className="community-staff-compact-card community-settings-item-card">
      <div className="community-staff-compact-card__main">
        <div className="community-staff-compact-card__identity">
          <span className="community-staff-compact-card__name">{title}</span>
          {subtitle ? (
            <span className="community-settings-item-card__subtitle">
              {subtitle}
            </span>
          ) : null}
        </div>
        <div className="community-staff-compact-card__status-wrap">
          <CommunityStaffActiveBadge isActive={isActive} />
        </div>
      </div>

      <div className="community-staff-compact-card__actions">
        <AdminTableActions>
          <AdminTableEditButton onClick={onEdit} label="עריכה" />
          <button
            type="button"
            className={`community-settings-item-card__toggle-btn${
              isActive
                ? " community-settings-item-card__toggle-btn--deactivate"
                : " community-settings-item-card__toggle-btn--activate"
            }`}
            onClick={onToggleActive}
            disabled={toggling}
          >
            {isActive ? "השבתה" : "הפעלה"}
          </button>
        </AdminTableActions>
      </div>
    </li>
  );
}

export default CommunitySettingsItemCard;
