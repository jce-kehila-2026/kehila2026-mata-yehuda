import { useState } from "react";
import AddStaffMember from "../components/staff/AddStaffMember";
import StaffList from "../components/staff/StaffList";
import EditStaffMember from "../components/staff/EditStaffMember";

function ManageStaff() {
    const [staffPage, setStaffPage] = useState("menu");
    const [selectedStaff, setSelectedStaff] = useState(null);

    return (
        <div>
            <h1>ניהול אנשי צוות</h1>

            {staffPage === "menu" && (
                <div className="dashboard-buttons">
                    <button onClick={() => setStaffPage("add")}>
                        הוספת איש צוות
                    </button>

                    <button onClick={() => setStaffPage("list")}>
                        רשימת אנשי צוות
                    </button>
                </div>
            )}

            {staffPage !== "menu" && (
                <button onClick={() => setStaffPage("menu")}>
                    חזרה לניהול אנשי צוות
                </button>
            )}

            {staffPage === "add" && <AddStaffMember />}

            {staffPage === "edit" && (
                <EditStaffMember staff={selectedStaff} />
            )}

            {staffPage === "list" && (
                <StaffList
                    onEditStaff={(staff) => {
                        setSelectedStaff(staff);
                        setStaffPage("edit");
                    }}
                />
            )}            </div>
    );
}

export default ManageStaff;