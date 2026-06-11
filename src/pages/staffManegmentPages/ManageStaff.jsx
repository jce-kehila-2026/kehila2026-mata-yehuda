import { useEffect, useState } from "react";
import AddStaffMember from "../../components/staff/AddStaffMember";
import StaffList from "../../components/staff/StaffList";
import EditStaffMember from "../../components/staff/EditStaffMember";
import { buildStaffPage, staffNavigateBack } from "../../utils/staffManegmentUtils/staffNavigation";

function ManageStaff({ staffView, onNavigate }) {
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [listRefreshKey, setListRefreshKey] = useState(0);
    const staffPage = staffView || "list";

    function refreshStaffList() {
        setListRefreshKey((previous) => previous + 1);
    }

    function navigateToView(view) {
        onNavigate(buildStaffPage("manageStaff", view));
    }

    function goBackToList() {
        setSelectedStaff(null);

        if (staffPage === "list") {
            return;
        }

        staffNavigateBack();
    }

    function handleAddStaffClick() {
        setSelectedStaff(null);
        navigateToView("add");
    }

    function handleEditStaff(staff) {
        setSelectedStaff(staff);
        navigateToView("edit");
    }

    useEffect(() => {
        if (staffPage !== "edit") {
            setSelectedStaff(null);
        }
    }, [staffPage]);

    function handleStaffSaved() {
        refreshStaffList();
        goBackToList();
    }

    return (
        <div className="staff-page staff-page--staff-management">
            <div className="staff-container staff-container--staff-management">
                {staffPage === "list" && (
                    <section className="staff-section staff-section--list staff-section--staff-list">
                        <StaffList
                            refreshKey={listRefreshKey}
                            onEditStaff={handleEditStaff}
                            onAddStaff={handleAddStaffClick}
                        />
                    </section>
                )}

                {staffPage === "add" && (
                    <section className="staff-section staff-section--form">
                        <div className="staff-toolbar">
                            <button
                                type="button"
                                className="staff-button staff-button--secondary staff-button--small"
                                onClick={goBackToList}
                            >
                                חזרה לרשימת אנשי צוות
                            </button>
                        </div>

                        <AddStaffMember
                            onSuccess={handleStaffSaved}
                            onCancel={goBackToList}
                        />
                    </section>
                )}

                {staffPage === "edit" && selectedStaff && (
                    <section className="staff-section staff-section--form">
                        <div className="staff-toolbar">
                            <button
                                type="button"
                                className="staff-button staff-button--secondary staff-button--small"
                                onClick={goBackToList}
                            >
                                חזרה לרשימת אנשי צוות
                            </button>
                        </div>

                        <h2>עריכת איש צוות</h2>

                        <EditStaffMember
                            key={selectedStaff.id}
                            staff={selectedStaff}
                            onCompleted={handleStaffSaved}
                            onCancel={goBackToList}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}

export default ManageStaff;
