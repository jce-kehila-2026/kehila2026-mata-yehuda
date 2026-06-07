import { hasValue } from "../../utils/hasValue";
import { getStaffFullName } from "../../utils/staffStatusLabels";
import StaffStatusBadge from "./StaffStatusBadge";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton,
    AdminTableViewButton
} from "../admin/AdminTableActions";

function StaffCard({ staff, onEdit, onView, onDisable }) {
    const fullName = getStaffFullName(staff) || "—";
    const handleView = onView || onEdit;

    return (
        <article className="staff-member-card staff-card">
            <div className="staff-member-card__body staff-card-body">
                <h3 className="staff-member-card__name">{fullName}</h3>

                {hasValue(staff.email) && (
                    <p className="staff-member-card__meta">אימייל: {staff.email}</p>
                )}
                {hasValue(staff.phone) && (
                    <p className="staff-member-card__meta">טלפון: {staff.phone}</p>
                )}
                <p className="staff-member-card__meta staff-member-card__meta--badge">
                    <span>סטטוס:</span>{" "}
                    <StaffStatusBadge isActive={staff.is_active} />
                </p>
            </div>

            <div className="staff-member-card__actions">
                <AdminTableActions>
                    {handleView ? (
                        <AdminTableViewButton
                            onClick={() => handleView(staff)}
                            label="צפייה בפרטי איש צוות"
                        />
                    ) : null}
                    <AdminTableEditButton
                        onClick={() => onEdit(staff)}
                        label="עריכת איש צוות"
                    />
                    <AdminTableDeleteButton
                        onClick={() => onDisable(staff)}
                        label="השבתת איש צוות"
                        disabled={!staff.is_active}
                    />
                </AdminTableActions>
            </div>
        </article>
    );
}

export default StaffCard;
