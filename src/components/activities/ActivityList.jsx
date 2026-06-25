import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, Plus, Users } from "lucide-react";
import ActivityCard from "./ActivityCard";
import ActivityStatusBadge from "./ActivityStatusBadge";
import AdminDataTable from "../admin/AdminDataTable";
import AdminListEmptyState from "../admin/AdminListEmptyState";
import AdminListToolbar from "../admin/AdminListToolbar";
import AdminResponsiveList from "../admin/AdminResponsiveList";
import { useAdminList } from "../../hooks/useAdminList";
import {
    countActivitiesRecords,
    fetchActivitiesForAdminList,
    filterActivitiesList,
    formatActivityOccupancy,
    getActivitySortValue
} from "../../services/staffManegmentServices/activityService";
import {
    ACTIVITY_DISPLAY_STATUS,
    getActivityDisplayStatus
} from "../../utils/staffManegmentUtils/activityStatus";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton
} from "../admin/AdminTableActions";
import {
    formatActivityDateOnly,
    formatActivityWeekday
} from "../../utils/staffManegmentUtils/dateUtils";

const ACTIVITY_COLUMNS = [
    { key: "name", label: "שם הפעילות", sortKey: "name" },
    { key: "weekday", label: "יום", sortKey: "weekday" },
    { key: "date", label: "תאריך", sortKey: "date" },
    { key: "participants", label: "משתתפים", sortKey: "participants" },
    { key: "status", label: "סטטוס", sortKey: "status" },
    { key: "actions", label: "פעולות" }
];

function ActivityList({ onDelete, onEdit, refreshKey = 0, onAddActivity, onBack }) {
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

    const activityStats = useMemo(() => {
        const now = new Date();
        let open = 0;
        let participants = 0;

        sourceItems.forEach((activity) => {
            const data = activity.data || {};
            const { status } = getActivityDisplayStatus(data, now);

            if (status === ACTIVITY_DISPLAY_STATUS.OPEN) {
                open += 1;
            }

            const current = Number(data.current_participants ?? 0);

            if (Number.isFinite(current)) {
                participants += current;
            }
        });

        return { total: sourceItems.length, open, participants };
    }, [sourceItems]);

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
            <header className="activities-mgmt-page__header">
                <div className="activities-mgmt-page__header-main">
                    <h2 className="activities-mgmt-page__title">ניהול פעילויות</h2>
                    <p className="activities-mgmt-page__subtitle">
                        ניהול, צפייה וחיפוש של כל הפעילויות במערכת
                    </p>
                </div>
                <div className="activities-mgmt-page__actions">
                    {onAddActivity ? (
                        <button
                            type="button"
                            className="activities-mgmt-page__action"
                            onClick={onAddActivity}
                        >
                            <Plus
                                className="activities-mgmt-page__action-icon"
                                strokeWidth={2.25}
                                aria-hidden="true"
                            />
                            <span>הוספת פעילות</span>
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
                            חזרה ללוח הבקרה
                        </button>
                    ) : null}
                </div>
            </header>

            {!loading && !loadError ? (
                <section
                    className="activities-mgmt-summary"
                    aria-label="סיכום פעילויות"
                >
                    <div className="activities-mgmt-summary__card activities-mgmt-summary__card--neutral">
                        <span className="activities-mgmt-summary__icon">
                            <CalendarDays size={22} strokeWidth={2} aria-hidden="true" />
                        </span>
                        <span className="activities-mgmt-summary__value">
                            {activityStats.total}
                        </span>
                        <span className="activities-mgmt-summary__label">
                            סה״כ פעילויות
                        </span>
                        <span className="activities-mgmt-summary__hint">
                            כל הפעילויות במערכת
                        </span>
                    </div>
                    <div className="activities-mgmt-summary__card activities-mgmt-summary__card--open">
                        <span className="activities-mgmt-summary__icon">
                            <ClipboardList size={22} strokeWidth={2} aria-hidden="true" />
                        </span>
                        <span className="activities-mgmt-summary__value">
                            {activityStats.open}
                        </span>
                        <span className="activities-mgmt-summary__label">
                            פעילויות פתוחות
                        </span>
                        <span className="activities-mgmt-summary__hint">
                            פעילויות בהרשמה
                        </span>
                    </div>
                    <div className="activities-mgmt-summary__card activities-mgmt-summary__card--participants">
                        <span className="activities-mgmt-summary__icon">
                            <Users size={22} strokeWidth={2} aria-hidden="true" />
                        </span>
                        <span className="activities-mgmt-summary__value">
                            {activityStats.participants}
                        </span>
                        <span className="activities-mgmt-summary__label">
                            סה״כ משתתפים רשומים
                        </span>
                        <span className="activities-mgmt-summary__hint">
                            בכל הפעילויות
                        </span>
                    </div>
                </section>
            ) : null}

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

            {loadError ? (
                <p className="staff-alert staff-alert--error">{loadError}</p>
            ) : null}

            {loading ? <p className="activities-mgmt-loading">טוען...</p> : null}

            {!loading && list.totalFiltered === 0 ? (
                <div className="activities-mgmt-list">{emptyState}</div>
            ) : null}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <div className="activities-mgmt-list">
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
                    </div>

                    <div className="activities-mgmt-pagination">
                        <button
                            type="button"
                            className="activities-mgmt-pagination__btn"
                            onClick={() => list.setPage(list.page - 1)}
                            disabled={list.page <= 1}
                        >
                            הקודם
                        </button>
                        <span className="activities-mgmt-pagination__label">
                            עמוד {list.page} מתוך {list.totalPages}
                        </span>
                        <button
                            type="button"
                            className="activities-mgmt-pagination__btn"
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

export default ActivityList;
