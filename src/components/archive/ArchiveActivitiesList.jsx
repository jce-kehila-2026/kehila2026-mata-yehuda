import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive } from "lucide-react";
import ActivityStatusBadge from "../activities/ActivityStatusBadge";
import AdminDataTable from "../admin/AdminDataTable";
import AdminListEmptyState from "../admin/AdminListEmptyState";
import AdminListPagination from "../admin/AdminListPagination";
import AdminListSummary from "../admin/AdminListSummary";
import AdminListToolbar from "../admin/AdminListToolbar";
import AdminResponsiveList from "../admin/AdminResponsiveList";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableRestoreButton
} from "../admin/AdminTableActions";
import StaffConfirmModal from "../staff/StaffConfirmModal";
import { useAdminList } from "../../hooks/useAdminList";
import { useStaffConfirmAction } from "../../hooks/useStaffConfirmAction";
import {
    fetchArchivedActivitiesForAdminList,
    filterActivitiesList,
    formatActivityOccupancy,
    getActivitySortValue,
    permanentlyDeleteActivity,
    restoreActivity
} from "../../services/staffManegmentServices/activityService";
import { PERMANENT_DELETE_CONFIRM_MESSAGE } from "../../utils/staffManegmentUtils/archiveUtils";
import {
    formatActivityDateOnly,
    formatActivityWeekday,
    formatDate
} from "../../utils/staffManegmentUtils/dateUtils";

const ARCHIVE_ACTIVITY_COLUMNS = [
    { key: "name", label: "שם הפעילות", sortKey: "name" },
    { key: "weekday", label: "יום", sortKey: "weekday" },
    { key: "date", label: "תאריך", sortKey: "date" },
    { key: "archivedAt", label: "תאריך העברה לארכיון" },
    { key: "status", label: "סטטוס", sortKey: "status" },
    { key: "actions", label: "פעולות" }
];

function ArchiveActivitiesList({ refreshKey = 0, onActionMessage }) {
    const [sourceItems, setSourceItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const confirm = useStaffConfirmAction();

    const filterItems = useCallback(
        (items, searchQuery) => filterActivitiesList(items, searchQuery, ""),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount: sourceItems.length,
        getSortValue: getActivitySortValue,
        initialSortField: "name"
    });

    async function loadArchivedActivities() {
        setLoading(true);
        setLoadError("");

        try {
            const records = await fetchArchivedActivitiesForAdminList();
            setSourceItems(records);
        } catch (error) {
            console.error(error);
            setLoadError("שגיאה בטעינת פעילויות מהארכיון");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadArchivedActivities();
    }, [refreshKey]);

    function handleRestore(activityId) {
        confirm.requestAction({
            message: "האם לשחזר את הפעילות מהארכיון?",
            confirmLabel: "שחזור",
            action: async () => {
                await restoreActivity(activityId);
                onActionMessage?.("הפעילות שוחזרה בהצלחה");
                await loadArchivedActivities();
            }
        });
    }

    function handlePermanentDelete(activityId) {
        confirm.requestAction({
            message: PERMANENT_DELETE_CONFIRM_MESSAGE,
            confirmLabel: "מחיקה סופית",
            action: async () => {
                await permanentlyDeleteActivity(activityId);
                onActionMessage?.("הפעילות נמחקה לצמיתות");
                await loadArchivedActivities();
            }
        });
    }

    const emptyState = useMemo(() => {
        if (loading) {
            return null;
        }

        if (sourceItems.length === 0) {
            return (
                <AdminListEmptyState
                    icon={Archive}
                    title="אין פעילויות בארכיון"
                    message="פעילויות שהועברו לארכיון יופיעו כאן."
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={Archive}
                    title="אין פריטים בארכיון"
                    message="נסו לשנות את החיפוש כדי למצוא פעילויות אחרות בארכיון."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered]);

    function renderActions(activity) {
        return (
            <AdminTableActions>
                <AdminTableRestoreButton
                    onClick={() => handleRestore(activity.id)}
                    label="שחזור פעילות"
                />
                <AdminTableDeleteButton
                    onClick={() => handlePermanentDelete(activity.id)}
                    label="מחיקה סופית"
                />
            </AdminTableActions>
        );
    }

    return (
        <div className="staff-list-section admin-list-section admin-list-section--archive admin-list-section--archive-activities">
            <div className="admin-list-header">
                <h2 className="admin-list-header__title">ארכיון פעילויות</h2>
            </div>

            <AdminListToolbar
                searchId="archive-activity-search"
                searchLabel="חיפוש"
                searchPlaceholder="חיפוש לפי שם פעילות"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="מספר פעילויות בעמוד"
            />

            <AdminListSummary
                totalCount={list.totalCount}
                totalFiltered={list.totalFiltered}
                pageCount={list.pageCount}
                page={list.page}
                totalPages={list.totalPages}
                showAll={list.showAll}
            />

            {loadError ? (
                <p className="staff-alert staff-alert--error">{loadError}</p>
            ) : null}

            {loading ? <p className="admin-archive-loading">טוען...</p> : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <AdminResponsiveList
                        desktopTable={
                            <AdminDataTable
                                ariaLabel="טבלת פעילויות בארכיון"
                                compact
                                columns={ARCHIVE_ACTIVITY_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((activity) => {
                                    const data = activity.data || {};

                                    return (
                                        <tr key={activity.id}>
                                            <td>{data.name || "—"}</td>
                                            <td>{formatActivityWeekday(data.start_date)}</td>
                                            <td>{formatActivityDateOnly(data.start_date)}</td>
                                            <td>{formatDate(data.archivedAt) || "—"}</td>
                                            <td>
                                                <ActivityStatusBadge data={data} />
                                            </td>
                                            <td>{renderActions(activity)}</td>
                                        </tr>
                                    );
                                })}
                            />
                        }
                        mobileCards={
                            <div className="activity-list staff-grid staff-grid--cards">
                                {list.pageItems.map((activity) => {
                                    const data = activity.data || {};

                                    return (
                                        <article
                                            key={activity.id}
                                            className="staff-card activity-card archive-card"
                                        >
                                            <div className="staff-card-body">
                                                <h3>{data.name || "—"}</h3>
                                                <p>
                                                    תאריך העברה לארכיון:{" "}
                                                    {formatDate(data.archivedAt) || "—"}
                                                </p>
                                                <p>
                                                    משתתפים: {formatActivityOccupancy(data)}
                                                </p>
                                                <p>
                                                    סטטוס:{" "}
                                                    <ActivityStatusBadge data={data} />
                                                </p>
                                            </div>
                                            <div className="activity-card-actions archive-card__actions">
                                                {renderActions(activity)}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        }
                    />

                    <AdminListPagination
                        page={list.page}
                        totalPages={list.totalPages}
                        onPageChange={list.setPage}
                    />
                </>
            ) : null}

            <StaffConfirmModal
                message={confirm.pendingAction?.message}
                confirmLabel={confirm.pendingAction?.confirmLabel}
                confirming={confirm.processing}
                onConfirm={confirm.confirm}
                onCancel={confirm.cancel}
            />
        </div>
    );
}

export default ArchiveActivitiesList;
