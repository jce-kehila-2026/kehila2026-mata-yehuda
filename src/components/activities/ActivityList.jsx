import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import ActivityCard from "./ActivityCard";
import ActivityStatusBadge from "./ActivityStatusBadge";
import AdminDataTable from "../admin/AdminDataTable";
import AdminListEmptyState from "../admin/AdminListEmptyState";
import AdminListPagination from "../admin/AdminListPagination";
import AdminListSummary from "../admin/AdminListSummary";
import AdminListToolbar from "../admin/AdminListToolbar";
import AdminResponsiveList from "../admin/AdminResponsiveList";
import { useAdminList } from "../../hooks/useAdminList";
import {
    countActivitiesRecords,
    fetchActivitiesForAdminList,
    filterActivitiesList,
    formatActivityOccupancy,
    getActivitySortValue
} from "../../services/activityService";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton
} from "../admin/AdminTableActions";
import {
    formatActivityDateOnly,
    formatActivityWeekday
} from "../../utils/dateUtils";

const ACTIVITY_COLUMNS = [
    { key: "name", label: "שם הפעילות", sortKey: "name" },
    { key: "weekday", label: "יום", sortKey: "weekday" },
    { key: "date", label: "תאריך", sortKey: "date" },
    { key: "participants", label: "משתתפים", sortKey: "participants" },
    { key: "status", label: "סטטוס", sortKey: "status" },
    { key: "actions", label: "פעולות" }
];

function ActivityList({ onDelete, onEdit, refreshKey = 0, onAddActivity }) {
    const [sourceItems, setSourceItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const filterItems = useCallback(
        (items, searchQuery, filters) =>
            filterActivitiesList(items, searchQuery, filters.openFilter || ""),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount,
        getSortValue: getActivitySortValue,
        initialSortField: "name"
    });

    async function loadActivities() {
        setLoading(true);
        setLoadError("");

        try {
            const [records, count] = await Promise.all([
                fetchActivitiesForAdminList(),
                countActivitiesRecords()
            ]);

            setSourceItems(records);
            setTotalCount(count);
        } catch (error) {
            console.error(error);
            setLoadError("שגיאה בטעינת הפעילויות");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadActivities();
    }, [refreshKey]);

    const toolbarFilters = (
        <>
            <div>
                <label htmlFor="activity-open-filter">סטטוס פעילות</label>
                <select
                    id="activity-open-filter"
                    value={list.filters.openFilter || ""}
                    onChange={(event) =>
                        list.setFilter("openFilter", event.target.value)
                    }
                >
                    <option value="">כל הסטטוסים</option>
                    <option value="open">פתוחות</option>
                    <option value="closed">סגורות</option>
                </select>
            </div>
        </>
    );

    const emptyState = useMemo(() => {
        if (loading) {
            return null;
        }

        if (sourceItems.length === 0) {
            return (
                <AdminListEmptyState
                    icon={CalendarDays}
                    title="אין פעילויות במערכת"
                    message="התחילו ביצירת הפעילות הראשונה כדי לאפשר הרשמה וניהול משתתפים."
                    actionLabel={onAddActivity ? "הוספת פעילות" : undefined}
                    onAction={onAddActivity}
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={CalendarDays}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש או את הסינון כדי למצוא פעילויות אחרות."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered, onAddActivity]);

    return (
        <div className="staff-list-section admin-list-section admin-list-section--activities">
            <div className="admin-list-header admin-list-header--split">
                <h2 className="admin-list-header__title">רשימת פעילויות</h2>
                {onAddActivity ? (
                    <button
                        type="button"
                        className="staff-button staff-button--small admin-list-header__action admin-list-header__action--compact"
                        onClick={onAddActivity}
                    >
                        <Plus
                            className="admin-list-header__action-icon"
                            strokeWidth={2.25}
                            aria-hidden="true"
                        />
                        <span>הוספת פעילות</span>
                    </button>
                ) : null}
            </div>

            <AdminListToolbar
                searchId="activity-search"
                searchLabel="חיפוש"
                searchPlaceholder="חיפוש לפי שם פעילות"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                filters={toolbarFilters}
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

            {loading ? <p>טוען...</p> : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <AdminResponsiveList
                        desktopTable={
                            <AdminDataTable
                                ariaLabel="טבלת פעילויות"
                                compact
                                columns={ACTIVITY_COLUMNS}
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
                                            <td className="admin-data-table__numeric">
                                                {formatActivityOccupancy(data)}
                                            </td>
                                            <td>
                                                <ActivityStatusBadge data={data} />
                                            </td>
                                            <td>
                                                <AdminTableActions>
                                                    {onEdit ? (
                                                        <AdminTableEditButton
                                                            onClick={() => onEdit(activity)}
                                                        />
                                                    ) : null}
                                                    <AdminTableDeleteButton
                                                        onClick={() => onDelete(activity.id)}
                                                    />
                                                </AdminTableActions>
                                            </td>
                                        </tr>
                                    );
                                })}
                            />
                        }
                        mobileCards={
                            <div className="activity-list staff-grid staff-grid--cards">
                                {list.pageItems.map((activity) => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                        onDelete={onDelete}
                                        onEdit={onEdit}
                                    />
                                ))}
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
        </div>
    );
}

export default ActivityList;
