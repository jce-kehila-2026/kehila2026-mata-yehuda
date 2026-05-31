import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "firebase/firestore";

export async function fetchStaffList() {
    const staffSnapshot = await getDocs(collection(db, "Staff"));

    return Promise.all(
        staffSnapshot.docs.map(async (staffDoc) => {
            const staff = staffDoc.data();
            const userSnap = await getDoc(doc(db, "user", staff.user_id));

            return {
                id: staffDoc.id,
                ...staff,
                user: userSnap.exists() ? userSnap.data() : null
            };
        })
    );
}

export async function addStaffMember(staffData) {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        staffData.email,
        staffData.password
    );

    const uid = userCredential.user.uid;

    await setDoc(doc(db, "user", uid), {
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        phone: staffData.phone,
        gender: staffData.gender,
        birthDate: staffData.birthDate,
        address: staffData.address,
        created_at: new Date()
    });

    await setDoc(doc(db, "Staff", uid), {
        user_id: uid,
        role: staffData.role,
        email: staffData.email,
        is_active: staffData.isActive
    });
}

export async function updateStaffMember(staff) {
    await updateDoc(doc(db, "user", staff.user_id), {
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone,
        gender: staff.gender,
        birthDate: staff.birthDate,
        address: staff.address
    });

    await updateDoc(doc(db, "Staff", staff.id), {
        role: staff.role,
        is_active: staff.isActive
    });
}

export async function disableStaffMember(staffId) {
    return updateDoc(doc(db, "Staff", staffId), {
        is_active: false
    });
}