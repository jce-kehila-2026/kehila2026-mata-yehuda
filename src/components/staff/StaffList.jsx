import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import StaffCard from "./StaffCard";
import StaffListStats from "./StaffListStats";
import StaffStatusBadge from "./StaffStatusBadge";
import AdminDataTable from "../admin/AdminDataTable";
import AdminListEmptyState from "../admin/AdminListEmptyState";
import AdminListToolbar from "../admin/AdminListToolbar";
import AdminResponsiveList from "../admin/AdminResponsiveList";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton,
    AdminTableViewButton
} from "../admin/AdminTableActions";
import { useAdminList } from "../../hooks/useAdminList";
import {
    countStaffRecords,
    disableStaffMember,
    fetchStaffForAdminList,
    filterStaffList,
    getStaffSortValue
} from "../../services/staffManegmentServices/staffService";
import { computeStaffListStats } from "../../utils/staffManegmentUtils/staffListStats";
import {
    getStaffFullName,
    STAFF_STATUS_FILTER_OPTIONS,
    toSafeString
} from "../../utils/staffManegmentUtils/staffStatusLabels";

const STAFF_COLUMNS = [
    { key: "name", label: "שם", sortKey: "name" },
    { key: "email", label: "אימייל", sortKey: "email" },
    { key: "phone", label: "טלפון" },
    { key: "status", label: "סטטוס", sortKey: "status" },
    { key: "actions", label: "פעולות" }
];

function StaffList({ refreshKey = 0, onEditStaff, onAddStaff, onBack }) {
    const [sourceItems, setSourceItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    const filterItems = useCallback(
        (items, searchQuery, filters) =>
            filterStaffList(items, searchQuery, filters),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount,
        getSortValue: getStaffSortValue,
        initialSortField: "name"
    });

    const filteredStaff = useMemo(
        () => filterStaffList(sourceItems, list.searchQuery, list.filters),
        [sourceItems, list.searchQuery, list.filters]
    );

    const staffStats = useMemo(
        () => computeStaffListStats(filteredStaff),
        [filteredStaff]
    );

    async function loadStaff() {
        setLoading(true);
        setError("");

        try {
            const [records, count] = await Promise.all([
                fetchStaffForAdminList(),
                countStaffRecords()
            ]);

            setSourceItems(records);
            setTotalCount(count);
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת אנשי הצוות");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStaff();
    }, [refreshKey]);

    async function handleDisableStaff(staff) {
        const confirmDisable = window.confirm(
            "האם אתה בטוח שברצונך להשבית איש צוות זה?"
        );

        if (!confirmDisable) {
            return;
        }

        try {
            await disableStaffMember(staff.id);
            setActionMessage("איש הצוות הושבת בהצלחה");
            await loadStaff();
        } catch (err) {
            console.error(err);
            setError("שגיאה בהשבתת איש הצוות");
        }
    }

    function renderStaffActions(staff) {
        return (
            <AdminTableActions>
                {onEditStaff ? (
                    <>
                        <AdminTableViewButton
                            onClick={() => onEditStaff(staff)}
                            label="צפייה בפרטי איש צוות"
                        />
                        <AdminTableEditButton
                            onClick={() => onEditStaff(staff)}
                            label="עריכת איש צוות"
                        />
                    </>
                ) : null}
                <AdminTableDeleteButton
                    onClick={() => handleDisableStaff(staff)}
                    label="השבתת איש צוות"
                    disabled={!staff.is_active}
                />
            </AdminTableActions>
        );
    }

    const toolbarFilters = (
        <div className="admin-list-toolbar__filter-item">
            <label htmlFor="staff-status-filter">סטטוס</label>
            <select
                id="staff-status-filter"
                value={list.filters.statusFilter || ""}
                onChange={(event) =>
                    list.setFilter("statusFilter", event.target.value)
                }
            >
                <option value="">כל הסטטוסים</option>
                {STAFF_STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const emptyState = useMemo(() => {
        if (loading) {
            return null;
        }

        if (sourceItems.length === 0) {
            return (
                <AdminListEmptyState
                    icon={Users}
                    title="אין אנשי צוות במערכת"
                    message="הוסיפו את איש הצוות הראשון כדי לאפשר כניסה למערכת הניהול."
                    actionLabel={onAddStaff ? "הוספת איש צוות" : undefined}
                    onAction={onAddStaff}
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={Users}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש או את הסינון כדי למצוא אנשי צוות אחרים."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered, onAddStaff]);

    return (
        <div className="staff-list-section admin-list-section admin-list-section--staff">
            <header className="list-mgmt-page__header">
                <div className="list-mgmt-page__header-main">
                    <h2 className="list-mgmt-page__title">רשימת אנשי צוות</h2>
                    <p className="list-mgmt-page__subtitle">
                        ניהול, צפייה וחיפוש של כל אנשי הצוות במערכת
                    </p>
                </div>
                <div className="list-mgmt-page__actions">
                    {onAddStaff ? (
                        <button
                            type="button"
                            className="list-mgmt-page__action"
                            onClick={onAddStaff}
                        >
                            <Plus
                                className="list-mgmt-page__action-icon"
                                strokeWidth={2.25}
                                aria-hidden="true"
                            />
                            <span>הוספת איש צוות</span>
                        </button>
                    ) : null}
                    {onBack ? (
                        <button
                            type="button"
                            className="staff-back-button"
                            onClick={onBack}
                        >
                            <span
                                className="staff-back-button__icon"
                                aria-hidden="true"
                            >
                                →
                            </span>
                            <span className="staff-back-button__label">
                                חזרה ללוח הבקרה
                            </span>
                        </button>
                    ) : null}
                </div>
            </header>

            {!loading && filteredStaff.length > 0 ? (
                <StaffListStats stats={staffStats} />
            ) : null}

            <AdminListToolbar
                layout="staff"
                searchId="staff-search"
                searchLabel="חיפוש"
                searchPlaceholder="שם, אימייל או טלפון"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                filters={toolbarFilters}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="הצג בעמוד"
                pageSizeOptions={[5, 10, 20]}
            />

            {error ? (
                <p className="staff-alert staff-alert--error">{error}</p>
            ) : null}
            {actionMessage ? (
                <p className="staff-alert staff-alert--success">{actionMessage}</p>
            ) : null}

            {loading ? (
                <p className="list-mgmt-loading">טוען...</p>
            ) : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <div className="list-mgmt-list">
                        <AdminResponsiveList
                            desktopTable={
                                <AdminDataTable
                                    ariaLabel="טבלת אנשי צוות"
                                    compact
                                    columns={STAFF_COLUMNS}
                                    sortField={list.sortField}
                                    sortDirection={list.sortDirection}
                                    onSort={list.handleSort}
                                    rows={list.pageItems.map((staff) => (
                                        <tr key={staff.id}>
                                            <td className="admin-data-table__name-cell">
                                                {getStaffFullName(staff) || "—"}
                                            </td>
                                            <td>{toSafeString(staff.email) || "—"}</td>
                                            <td className="admin-data-table__numeric">
                                                {toSafeString(staff.phone) || "—"}
                                            </td>
                                            <td>
                                                <StaffStatusBadge isActive={staff.is_active} />
                                            </td>
                                            <td>{renderStaffActions(staff)}</td>
                                        </tr>
                                    ))}
                                />
                            }
                            mobileCards={
                                <div className="staff-members-list staff-grid staff-grid--cards">
                                    {list.pageItems.map((staff) => (
                                        <StaffCard
                                            key={staff.id}
                                            staff={staff}
                                            onEdit={onEditStaff}
                                            onView={onEditStaff}
                                            onDisable={handleDisableStaff}
                                        />
                                    ))}
                                </div>
                            }
                        />
                    </div>

                    <div className="list-mgmt-pagination">
                        <button
                            type="button"
                            className="list-mgmt-pagination__btn"
                            onClick={() => list.setPage(list.page - 1)}
                            disabled={list.page <= 1}
                        >
                            הקודם
                        </button>
                        <span className="list-mgmt-pagination__label">
                            עמוד {list.page} מתוך {list.totalPages}
                        </span>
                        <button
                            type="button"
                            className="list-mgmt-pagination__btn"
                            onClick={() => list.setPage(list.page + 1)}
                            disabled={list.page >= list.totalPages}
                        >
                            הבא
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default StaffList;
