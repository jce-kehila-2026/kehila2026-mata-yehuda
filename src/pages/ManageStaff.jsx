import { useState, useEffect } from "react";
import AddStaffMember from "../components/staff/AddStaffMember";
import StaffList from "../components/staff/StaffList";
import EditStaffMember from "../components/staff/EditStaffMember";
import { buildStaffPage, staffNavigateBack } from "../utils/staffNavigation";

function ManageStaff({ staffView, onNavigate }) {
    const [selectedStaff, setSelectedStaff] = useState(null);
    const staffPage = staffView || "menu";

    function navigateToView(view) {
        onNavigate(buildStaffPage("manageStaff", view));
    }

    function goBack() {
        staffNavigateBack();
    }

    useEffect(() => {
        if (staffPage !== "edit") {
            setSelectedStaff(null);
        }
    }, [staffPage]);

    return (
        <div className="staff-page staff-page--staff">
            <header className="staff-header">
                <h1>ניהול אנשי צוות</h1>
            </header>

            <div className="staff-container">
                {staffPage === "menu" && (
                    <div className="staff-actions staff-actions--inline">
                        <button
                            type="button"
                            className="staff-button"
                            onClick={() => navigateToView("add")}
                        >
                            הוספת איש צוות
                        </button>

                        <button
                            type="button"
                            className="staff-button"
                            onClick={() => navigateToView("list")}
                        >
                            רשימת אנשי צוות
                        </button>
                    </div>
                )}

                {staffPage !== "menu" && (
                    <div className="staff-toolbar">
                        <button
                            type="button"
                            className="staff-button staff-button--secondary staff-button--small"
                            onClick={goBack}
                        >
                            חזרה לניהול אנשי צוות
                        </button>
                    </div>
                )}

                {staffPage === "add" && (
                    <section className="staff-section">
                        <AddStaffMember />
                    </section>
                )}

                {staffPage === "edit" && (
                    <section className="staff-section">
                        <EditStaffMember staff={selectedStaff} />
                    </section>
                )}

                {staffPage === "list" && (
                    <section className="staff-section staff-section--list">
                        <StaffList
                            onEditStaff={(staff) => {
                                setSelectedStaff(staff);
                                navigateToView("edit");
                            }}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}

export default ManageStaff;
