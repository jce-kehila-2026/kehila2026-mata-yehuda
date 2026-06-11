import { fetchActivities } from "./activityService";
import {
    fetchRegistrationsByParticipantId,
    normalizeFirestoreId
} from "./registrationService";
import {
    NOTIFICATION_GROUP_ALL,
    deriveNotificationGroupsFromRegistrations
} from "../../utils/staffManegmentUtils/notificationGroupMapping";

/**
 * Resolves notification token groups for a verified participant.
 * Unverified opt-ins (no participantId) should use [NOTIFICATION_GROUP_ALL] only.
 */
export async function getParticipantNotificationGroups(participantId) {
    const normalizedParticipantId = normalizeFirestoreId(participantId);

    if (!normalizedParticipantId) {
        return [NOTIFICATION_GROUP_ALL];
    }

    const [registrations, activities] = await Promise.all([
        fetchRegistrationsByParticipantId(normalizedParticipantId),
        fetchActivities()
    ]);

    const activitiesById = new Map(
        activities.map((activity) => [activity.id, activity])
    );

    return deriveNotificationGroupsFromRegistrations(
        registrations,
        activitiesById
    );
}
