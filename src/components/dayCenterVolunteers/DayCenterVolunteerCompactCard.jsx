import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton,
    AdminTableViewButton
} from "../admin/AdminTableActions";
import ReactivateVolunteerButton from "../admin/ReactivateVolunteerButton";
import { getVolunteerDisplayName } from "../../services/dayCenterVolunteerService";

function DayCenterVolunteerCompactCard({
    volunteer,
    onViewDetails,
    onEdit,
    onDeactivate,
    onReactivate
}) {
    const fullName = getVolunteerDisplayName(volunteer);
    const isActive = volunteer.is_active !== false;

    return (
        <article
            className={`day-center-volunteers-card${
                isActive ? "" : " day-center-volunteers-card--inactive"
            }`}
        >
            <div className="day-center-volunteers-card__header">
                <h3 className="day-center-volunteers-card__title">{fullName}</h3>
                <span
                    className={`day-center-volunteers-card__status day-center-volunteers-card__status--${
                        isActive ? "active" : "inactive"
                    }`}
                >
                    {isActive ? "פעיל" : "לא פעיל"}
                </span>
            </div>

            <dl className="day-center-volunteers-card__details">
                {volunteer.id_number ? (
                    <div>
                        <dt>תעודת זהות</dt>
                        <dd>{volunteer.id_number}</dd>
                    </div>
                ) : null}
                <div>
                    <dt>טלפון</dt>
                    <dd>{volunteer.phone || "—"}</dd>
                </div>
                {volunteer.about_me?.trim() ? (
                    <div>
                        <dt>אודות</dt>
                        <dd>{volunteer.about_me}</dd>
                    </div>
                ) : null}
            </dl>

            <div className="day-center-volunteers-card__actions">
                <AdminTableActions>
                    <AdminTableViewButton
                        onClick={() => onViewDetails?.(volunteer)}
                        label="צפייה בפרטי מתנדב/ת"
                    />
                    <AdminTableEditButton
                        onClick={() => onEdit?.(volunteer)}
                        label="עריכת מתנדב/ת"
                    />
                    {isActive ? (
                        <AdminTableDeleteButton
                            onClick={() => onDeactivate?.(volunteer)}
                            label="השבתת מתנדב/ת"
                        />
                    ) : (
                        <ReactivateVolunteerButton
                            onClick={() => onReactivate?.(volunteer)}
                        />
                    )}
                </AdminTableActions>
            </div>
        </article>
    );
}

export default DayCenterVolunteerCompactCard;
