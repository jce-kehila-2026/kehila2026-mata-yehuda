import { useCallback, useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import DayCenterVolunteerCompactCard from "./DayCenterVolunteerCompactCard";
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
import ReactivateVolunteerButton from "../admin/ReactivateVolunteerButton";
import StaffConfirmModal from "../staff/StaffConfirmModal";
import { useAdminList } from "../../hooks/useAdminList";
import {
    deactivateDayCenterVolunteer,
    filterDayCenterVolunteersList,
    getDayCenterVolunteers,
    getDayCenterVolunteerSortValue,
    getVolunteerDisplayName,
    reactivateDayCenterVolunteer,
    VOLUNTEER_STATUS_FILTER_ACTIVE,
    VOLUNTEER_STATUS_FILTER_ALL,
    VOLUNTEER_STATUS_FILTER_INACTIVE
} from "../../services/dayCenterVolunteerService";

const VOLUNTEER_COLUMNS = [
    { key: "name", label: "שם", sortKey: "name" },
    { key: "id_number", label: "ת.ז." },
    { key: "phone", label: "טלפון", sortKey: "phone" },
    { key: "about_me", label: "אודות" },
    { key: "status", label: "סטטוס", sortKey: "is_active" },
    { key: "actions", label: "פעולות" }
];

function DayCenterVolunteersList({
    refreshKey = 0,
    onEditVolunteer,
    onViewDetails,
    onVolunteerUpdated,
    onShowError
}) {
    const [sourceItems, setSourceItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pendingActionVolunteer, setPendingActionVolunteer] = useState(null);
    const [pendingActionType, setPendingActionType] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const filterItems = useCallback(
        (items, searchQuery, filters) =>
            filterDayCenterVolunteersList(
                items,
                searchQuery,
                filters.statusFilter || VOLUNTEER_STATUS_FILTER_ALL
            ),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount: sourceItems.length,
        getSortValue: getDayCenterVolunteerSortValue,
        initialSortField: "name"
    });

    const loadVolunteers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const records = await getDayCenterVolunteers();
            setSourceItems(records);
        } catch (loadError) {
            console.error(loadError);
            setError("שגיאה בטעינת מתנדבי מרכז היום");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVolunteers();
    }, [loadVolunteers, refreshKey]);

    function openDeactivateConfirm(volunteer) {
        setPendingActionVolunteer(volunteer);
        setPendingActionType("deactivate");
    }

    function openReactivateConfirm(volunteer) {
        setPendingActionVolunteer(volunteer);
        setPendingActionType("reactivate");
    }

    async function handleConfirmAction() {
        if (!pendingActionVolunteer || !pendingActionType) {
            return;
        }

        setIsProcessing(true);

        try {
            if (pendingActionType === "deactivate") {
                await deactivateDayCenterVolunteer(pendingActionVolunteer.id);
                onVolunteerUpdated?.({ successMessage: "המתנדב הושבת בהצלחה" });
            } else {
                await reactivateDayCenterVolunteer(pendingActionVolunteer.id);
                onVolunteerUpdated?.({ successMessage: "המתנדב הופעל בהצלחה" });
            }

            setPendingActionVolunteer(null);
            setPendingActionType(null);
            await loadVolunteers();
        } catch (actionError) {
            console.error(actionError);
            onShowError?.("אירעה שגיאה. נסו שוב.");
        } finally {
            setIsProcessing(false);
        }
    }

    const toolbarFilters = (
        <div className="admin-list-toolbar__filter-item">
            <label htmlFor="day-center-volunteers-status-filter">סטטוס</label>
            <select
                id="day-center-volunteers-status-filter"
                value={list.filters.statusFilter || VOLUNTEER_STATUS_FILTER_ALL}
                onChange={(event) =>
                    list.setFilter("statusFilter", event.target.value)
                }
            >
                <option value={VOLUNTEER_STATUS_FILTER_ALL}>כל המתנדבים</option>
                <option value={VOLUNTEER_STATUS_FILTER_ACTIVE}>פעילים</option>
                <option value={VOLUNTEER_STATUS_FILTER_INACTIVE}>לא פעילים</option>
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
                    title="אין מתנדבים במערכת"
                    message="הוסיפו את המתנדב/ת הראשון/ה כדי להתחיל לנהל את מרכז היום."
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={Users}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש או את הסינון כדי למצוא מתנדבים אחרים."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered]);

    function renderVolunteerActions(volunteer) {
        const isActive = volunteer.is_active !== false;

        return (
            <AdminTableActions>
                <AdminTableViewButton
                    onClick={() => onViewDetails?.(volunteer)}
                    label="צפייה בפרטי מתנדב/ת"
                />
                <AdminTableEditButton
                    onClick={() => onEditVolunteer?.(volunteer)}
                    label="עריכת מתנדב/ת"
                />
                {isActive ? (
                    <AdminTableDeleteButton
                        onClick={() => openDeactivateConfirm(volunteer)}
                        label="השבתת מתנדב/ת"
                        disabled={isProcessing}
                    />
                ) : (
                    <ReactivateVolunteerButton
                        onClick={() => openReactivateConfirm(volunteer)}
                        disabled={isProcessing}
                    />
                )}
            </AdminTableActions>
        );
    }

    return (
        <div className="staff-list-section admin-list-section admin-list-section--day-center-volunteers">
            <AdminListToolbar
                searchId="day-center-volunteers-search"
                searchLabel="חיפוש"
                searchPlaceholder="שם, תעודת זהות, טלפון או תוכן אישי"
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

            {loading ? (
                <p className="list-mgmt-loading">טוען מתנדבים...</p>
            ) : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <div className="list-mgmt-list">
                        <AdminResponsiveList
                            desktopTable={
                                <AdminDataTable
                                    ariaLabel="טבלת מתנדבי מרכז יום"
                                    compact
                                    columns={VOLUNTEER_COLUMNS}
                                    sortField={list.sortField}
                                    sortDirection={list.sortDirection}
                                    onSort={list.handleSort}
                                    rows={list.pageItems.map((volunteer) => {
                                        const isActive =
                                            volunteer.is_active !== false;

                                        return (
                                            <tr
                                                key={volunteer.id}
                                                className={
                                                    isActive
                                                        ? undefined
                                                        : "day-center-volunteers-list__row--inactive"
                                                }
                                            >
                                                <td className="admin-data-table__name-cell">
                                                    {getVolunteerDisplayName(volunteer)}
                                                </td>
                                                <td className="admin-data-table__numeric">
                                                    {volunteer.id_number || "—"}
                                                </td>
                                                <td className="admin-data-table__numeric">
                                                    {volunteer.phone || "—"}
                                                </td>
                                                <td className="day-center-volunteers-list__about-cell">
                                                    {volunteer.about_me?.trim() ? (
                                                        <span className="day-center-volunteers-list__about-preview">
                                                            {volunteer.about_me}
                                                        </span>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                                <td className="day-center-volunteers-list__status-cell">
                                                    <span
                                                        className={`day-center-volunteers-list__status day-center-volunteers-list__status--${
                                                            isActive
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        {isActive ? "פעיל" : "לא פעיל"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {renderVolunteerActions(volunteer)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                />
                            }
                            mobileCards={
                                <div className="day-center-volunteers-cards">
                                    {list.pageItems.map((volunteer) => (
                                        <DayCenterVolunteerCompactCard
                                            key={volunteer.id}
                                            volunteer={volunteer}
                                            onViewDetails={onViewDetails}
                                            onEdit={onEditVolunteer}
                                            onDeactivate={openDeactivateConfirm}
                                            onReactivate={openReactivateConfirm}
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

            <StaffConfirmModal
                message={
                    pendingActionVolunteer
                        ? pendingActionType === "deactivate"
                            ? "להשבית את המתנדב/ה?"
                            : "להפעיל את המתנדב/ה מחדש?"
                        : ""
                }
                confirmLabel={
                    pendingActionType === "deactivate" ? "השבתה" : "הפעלה מחדש"
                }
                confirming={isProcessing}
                onConfirm={handleConfirmAction}
                onCancel={() => {
                    if (!isProcessing) {
                        setPendingActionVolunteer(null);
                        setPendingActionType(null);
                    }
                }}
            />
        </div>
    );
}

export default DayCenterVolunteersList;
