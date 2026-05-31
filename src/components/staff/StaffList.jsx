import { useEffect, useState } from "react";
import {
    fetchStaffList,
    disableStaffMember
} from "../../services/staffService";


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
            await disableStaffMember(staff.id);

            setStaffList(
                staffList.filter((item) => item.id !== staff.id)
            );

            alert("איש הצוות הושבת בהצלחה");

        } catch (err) {
            console.log(err);
            alert(err.message);
        }
    }

    async function loadStaff() {
        const data = await fetchStaffList();
        setStaffList(data);
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