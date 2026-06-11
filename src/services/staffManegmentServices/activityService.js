import { db } from "../../config/firebase";
import {
    addDoc,
    collection,
    getCountFromServer,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    limit
} from "firebase/firestore";
import { normalizeSearchQuery } from "../../utils/staffManegmentUtils/adminListUtils";
import { getActivityWeekdaySortValue } from "../../utils/staffManegmentUtils/dateUtils";
import {
    getActivityStatusSortValue,
    matchesActivityOpenFilter
} from "../../utils/staffManegmentUtils/activityStatus";

const activitiesCollection = collection(db, "activities");
const ADMIN_QUERY_LIMIT = 1000;

function mapActivityDoc(activityDoc) {
    return {
        id: activityDoc.id,
        data: activityDoc.data()
    };
}

export function filterActivitiesList(activities, searchQuery, openFilter) {
    const queryText = normalizeSearchQuery(searchQuery);

    return activities.filter((activity) => {
        const data = activity.data || {};

        if (!matchesActivityOpenFilter(data, openFilter)) {
            return false;
        }

        if (!queryText) {
            return true;
        }

        return normalizeSearchQuery(data.name).includes(queryText);
    });
}

export function formatActivityOccupancy(data) {
    if (!data) {
        return "—";
    }

    const current = Number(data.current_participants ?? 0);
    const max = Number(data.max_participants ?? 0);

    if (!Number.isFinite(max) || max <= 0) {
        return `${current} / —`;
    }

    return `${current} / ${max}`;
}

export function getActivitySortValue(activity, sortField) {
    const data = activity.data || {};

    switch (sortField) {
        case "name":
            return data.name || "";
        case "weekday":
            return getActivityWeekdaySortValue(data.start_date);
        case "date":
            return data.start_date || null;
        case "status":
            return getActivityStatusSortValue(data);
        case "participants":
            return data.current_participants ?? 0;
        default:
            return data.name || "";
    }
}

export async function countActivitiesRecords() {
    const snapshot = await getCountFromServer(query(activitiesCollection));
    return snapshot.data().count;
}

export async function fetchActivitiesForAdminList() {
    const constraints = [orderBy("name"), limit(ADMIN_QUERY_LIMIT)];

    const snapshot = await getDocs(query(activitiesCollection, ...constraints));
    return snapshot.docs.map(mapActivityDoc);
}

export async function fetchActivityTypes() {
    const docs = await getDocs(collection(db, "activityTypes"));
    return docs.docs.map(d => ({
        id: d.id,
        data: d.data()
    }));
}

export async function fetchActivities() {
    const docs = await getDocs(activitiesCollection);
    return docs.docs.map(mapActivityDoc);
}

export async function addActivity(activityData) {
    return addDoc(activitiesCollection, activityData);
}

export async function updateActivity(activityId, activityData) {
    const activityRef = doc(db, "activities", activityId);
    await updateDoc(activityRef, activityData);
}

export async function deleteActivity(activityId) {
    return deleteDoc(doc(db, "activities", activityId));
}
