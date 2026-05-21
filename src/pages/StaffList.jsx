import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "../config/firebase";

function StaffList({ onEditStaff }) {
    const [staffList, setStaffList] = useState([]);
    async function handleDeleteStaff(staff) {
        const confirmDelete = window.confirm(
            "האם אתה בטוח שברצונך להשבית איש צוות זה?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await updateDoc(doc(db, "Staff", staff.id), {
                is_active: false
            });

            loadStaff();

            alert("איש הצוות הושבת בהצלחה");

        } catch (err) {
            console.log(err);
            alert(err.message);
        }
    }

    async function handleDeleteStaff(staff) {
        const confirmDelete = window.confirm(
            "האם אתה בטוח שברצונך למחוק איש צוות זה?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await updateDoc(doc(db, "Staff", staff.id), {
                is_active: false
            });

            setStaffList(
                staffList.filter((item) => item.id !== staff.id)
            );

            alert("איש הצוות נמחק בהצלחה");

        } catch (err) {
            console.log(err);
            alert(err.message);
        }
    }

    async function loadStaff() {
        const staffSnapshot = await getDocs(collection(db, "Staff"));

        const staffData = await Promise.all(
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

        setStaffList(staffData);
    }

    useEffect(() => {
        loadStaff();
    }, []);

    return (
        <div>
            <h2>רשימת אנשי צוות</h2>

            {staffList.map((staff) => (
                <div key={staff.id}>
                    <p>
                        שם: {staff.user?.firstName || "לא קיים"} {staff.user?.lastName || ""}
                    </p>

                    <p>אימייל: {staff.email}</p>

                    <p>
                        טלפון: {staff.user?.phone || "לא קיים"}
                    </p>

                    <p>תפקיד: {staff.role}</p>
                    <p>סטטוס: {staff.is_active ? "פעיל" : "לא פעיל"}</p>

                    <div className="row">
                        <button onClick={() => onEditStaff(staff)}>
                            עריכה
                        </button>

                        <button onClick={() => handleDeleteStaff(staff)}>
                            מחיקה
                        </button>
                    </div>

                    <hr />
                </div>
            ))}
        </div>
    );
}

export default StaffList;