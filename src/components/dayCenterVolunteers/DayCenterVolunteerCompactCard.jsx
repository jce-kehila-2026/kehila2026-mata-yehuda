import { CommunityStaffActiveBadge, CommunityStaffCompactCard } from "../communityStaff/CommunityStaffListUi.jsx";
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
        <CommunityStaffCompactCard
            className="day-center-volunteers-compact-card"
            name={fullName}
            phone={volunteer.phone}
            inactive={!isActive}
            status={<CommunityStaffActiveBadge isActive={isActive} />}
            viewLabel="צפייה"
            primaryLabel="עריכה"
            onPrimaryClick={() => onEdit?.(volunteer)}
            onViewDetails={() => onViewDetails?.(volunteer)}
            onDeactivate={isActive ? () => onDeactivate?.(volunteer) : undefined}
            onReactivate={!isActive ? () => onReactivate?.(volunteer) : undefined}
            deactivateLabel="השבתה"
            extraIdentityContent={
                <>
                    {volunteer.id_number ? (
                        <span className="day-center-volunteers-compact-card__meta">
                            ת.ז. {volunteer.id_number}
                        </span>
                    ) : null}
                    {volunteer.about_me?.trim() ? (
                        <span
                            className="day-center-volunteers-compact-card__about"
                            title={volunteer.about_me}
                        >
                            {volunteer.about_me}
                        </span>
                    ) : null}
                </>
            }
        />
    );
}

export default DayCenterVolunteerCompactCard;
