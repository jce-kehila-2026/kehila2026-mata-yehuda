import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc
} from "firebase/firestore";



export async function fetchStaffList() {

    const staffSnapshot = await getDocs(collection(db, "Staff"));
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

    await setDoc(doc(db, "Staff", uid), {
        full_name: staffData.full_name,
        phone: staffData.phone,
        email: staffData.email,
        is_active: staffData.is_active ?? false,
        password: staffData.password
    });
}



export async function updateStaffMember(staff) {

    const updates = {

        full_name: staff.full_name,

        phone: staff.phone,

        is_active: staff.is_active ?? false

    };



    if (staff.password?.trim()) {

        updates.password = staff.password;

    }



    await updateDoc(doc(db, "Staff", staff.id), updates);

}



export async function disableStaffMember(staffId) {

    return updateDoc(doc(db, "Staff", staffId), {

        is_active: false

    });

}

