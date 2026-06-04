import { useEffect, useMemo, useState } from "react";
import {
    fetchStaffList,
    disableStaffMember
} from "../../services/staffService";
import { hasValue } from "../../utils/hasValue";

function filterStaffList(staffList, searchQuery, statusFilter) {
    const query = searchQuery.trim().toLowerCase();

    return staffList.filter((staff) => {
        if (statusFilter === "active" && !staff.is_active) {
            return false;
        }
        if (statusFilter === "inactive" && staff.is_active) {
            return false;
        }

        if (!query) {
            return true;
        }

        const fullName = (staff.full_name || "").toLowerCase();
        const email = (staff.email || "").toLowerCase();
        const phone = (staff.phone || "").toLowerCase();

        return (
            fullName.includes(query) ||
            email.includes(query) ||
            phone.includes(query)
        );
    });
}

function StaffList({ onEditStaff }) {
    const [staffList, setStaffList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const filteredStaff = useMemo(
        () => filterStaffList(staffList, searchQuery, statusFilter),
        [staffList, searchQuery, statusFilter]
    );

    async function handleDeleteStaff(staff) {
        const confirmDelete = window.confirm(
            "האם אתה בטוח שברצונך להשבית איש צוות זה?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await disableStaffMember(staff.id);

            setStaffList((prev) =>
                prev.map((item) =>
                    item.id === staff.id ? { ...item, is_active: false } : item
                )
            );

            alert("איש הצוות הושבת בהצלחה");
        } catch (err) {
            console.log(err);
            alert(err.message);
        }
    }

    async function loadStaff() {
        setLoading(true);
        try {
            const data = await fetchStaffList();
            setStaffList(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStaff();
    }, []);

    return (
        <div className="staff-list-section">
            <h2>רשימת אנשי צוות</h2>

            <div className="staff-form staff-list-filters">
                <label htmlFor="staff-search">חיפוש</label>
                <input
                    id="staff-search"
                    type="text"
                    placeholder="שם, אימייל או טלפון"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <label htmlFor="staff-status-filter">סטטוס</label>
                <select
                    id="staff-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">כל הסטטוסים</option>
                    <option value="active">פעיל</option>
                    <option value="inactive">לא פעיל</option>
                </select>

                <p className="staff-list-count">
                    נמצאו {filteredStaff.length} מתוך {staffList.length}
                </p>
            </div>

            {loading && <p>טוען...</p>}

            {!loading && staffList.length === 0 && (
                <p>אין אנשי צוות במערכת</p>
            )}

            {!loading && staffList.length > 0 && filteredStaff.length === 0 && (
                <p>לא נמצאו תוצאות לחיפוש</p>
            )}

            <div className="staff-list staff-grid staff-grid--cards">
                {filteredStaff.map((staff) => (
                    <div key={staff.id} className="staff-card">
                        <div className="staff-card-body">
                            {hasValue(staff.full_name) && (
                                <p>שם: {staff.full_name}</p>
                            )}
                            {hasValue(staff.email) && <p>אימייל: {staff.email}</p>}
                            {hasValue(staff.phone) && <p>טלפון: {staff.phone}</p>}
                            <p>סטטוס: {staff.is_active ? "פעיל" : "לא פעיל"}</p>
                        </div>

                        <div className="staff-card-actions">
                            <button
                                type="button"
                                className="staff-button staff-button--small staff-button--secondary"
                                onClick={() => onEditStaff(staff)}
                            >
                                עריכה
                            </button>

                            <button
                                type="button"
                                className="staff-button staff-button--small staff-button--danger"
                                onClick={() => handleDeleteStaff(staff)}
                                disabled={!staff.is_active}
                            >
                                השבתה
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StaffList;
