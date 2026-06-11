import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
    collection,
    getCountFromServer,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    query,
    orderBy,
    limit
} from "firebase/firestore";
import { DEFAULT_STAFF_ROLE, normalizeStaffRole } from "../config/staffRoles";
import { normalizeSearchQuery } from "../utils/adminListUtils";
import {
    getStaffNameParts,
    matchesStaffStatusFilter,
    toSafeString
} from "../utils/staffStatusLabels";

const staffCollection = collection(db, "staff");
const ADMIN_QUERY_LIMIT = 1000;

export function filterStaffList(staffList, searchQuery, filters = {}) {
    const queryText = normalizeSearchQuery(searchQuery);
    const statusFilter = filters.statusFilter || "";

    return staffList.filter((staff) => {
        if (!matchesStaffStatusFilter(staff, statusFilter)) {
            return false;
        }

        if (!queryText) {
            return true;
        }

        const fullName = normalizeSearchQuery(toSafeString(staff.full_name));
        const { firstName, lastName } = getStaffNameParts(staff);
        const normalizedFirstName = normalizeSearchQuery(firstName);
        const normalizedLastName = normalizeSearchQuery(lastName);
        const email = normalizeSearchQuery(toSafeString(staff.email));
        const phone = normalizeSearchQuery(toSafeString(staff.phone));

        return (
            fullName.includes(queryText) ||
            normalizedFirstName.includes(queryText) ||
            normalizedLastName.includes(queryText) ||
            email.includes(queryText) ||
            phone.includes(queryText)
        );
    });
}

export function getStaffSortValue(staff, sortField) {
    switch (sortField) {
        case "name":
            return toSafeString(staff.full_name);
        case "email":
            return toSafeString(staff.email);
        case "status":
            return staff.is_active ? 1 : 0;
        default:
            return toSafeString(staff.full_name);
    }
}

export async function countStaffRecords() {
    const snapshot = await getCountFromServer(query(staffCollection));
    return snapshot.data().count;
}

export async function fetchStaffForAdminList() {
    const snapshot = await getDocs(
        query(staffCollection, orderBy("full_name"), limit(ADMIN_QUERY_LIMIT))
    );

    return snapshot.docs.map((staffDoc) => ({
        id: staffDoc.id,
        ...staffDoc.data()
    }));
}

export async function fetchStaffList() {
    const staffSnapshot = await getDocs(staffCollection);
    return staffSnapshot.docs.map((staffDoc) => ({
        id: staffDoc.id,
        ...staffDoc.data()
    }));
}

export async function addStaffMember(staffData) {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        staffData.email,
        staffData.password
    );
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "staff", uid), {
        full_name: staffData.full_name,
        phone: staffData.phone,
        email: staffData.email,
        is_active: staffData.is_active ?? false,
        role: normalizeStaffRole(staffData.role ?? DEFAULT_STAFF_ROLE),
        password: staffData.password
    });
}

export async function updateStaffMember(staff) {
    const updates = {
        full_name: staff.full_name,
        phone: staff.phone,
        is_active: staff.is_active ?? false,
        role: normalizeStaffRole(staff.role ?? DEFAULT_STAFF_ROLE)
    };

    if (staff.password?.trim()) {
        updates.password = staff.password;
    }

    await updateDoc(doc(db, "staff", staff.id), updates);
}

export async function disableStaffMember(staffId) {
    return updateDoc(doc(db, "staff", staffId), {
        is_active: false
    });
}
