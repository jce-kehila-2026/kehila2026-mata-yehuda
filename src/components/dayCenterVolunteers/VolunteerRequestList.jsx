import { useCallback, useMemo } from "react";
import { ClipboardList } from "lucide-react";
import AdminDataTable from "../admin/AdminDataTable";
import AdminListEmptyState from "../admin/AdminListEmptyState";
import AdminListPagination from "../admin/AdminListPagination";
import AdminListSummary from "../admin/AdminListSummary";
import AdminListToolbar from "../admin/AdminListToolbar";
import AdminResponsiveList from "../admin/AdminResponsiveList";
import { useAdminList } from "../../hooks/useAdminList";
import {
    filterDayCenterVolunteerRequestsList,
    getDayCenterVolunteerRequestSortValue,
    getRequestDisplayName,
    getRequestStatusLabel,
    REQUEST_STATUS_PENDING
} from "../../services/dayCenterVolunteerRequestService";
import VolunteerRequestCard from "./VolunteerRequestCard";

const REQUEST_COLUMNS = [
    { key: "name", label: "שם", sortKey: "name" },
    { key: "phone", label: "טלפון", sortKey: "phone" },
    { key: "status", label: "סטטוס", sortKey: "status" },
    { key: "actions", label: "פעולות" }
];

function VolunteerRequestList({
    requests = [],
    loading = false,
    error = "",
    actionMessage = "",
    statusFilter = REQUEST_STATUS_PENDING,
    onStatusFilterChange,
    onViewDetails
}) {
    const filterItems = useCallback(
        (items, searchQuery) =>
            filterDayCenterVolunteerRequestsList(items, searchQuery, statusFilter),
        [statusFilter]
    );

    const list = useAdminList({
        sourceItems: requests,
        filterItems,
        totalCount: requests.length,
        getSortValue: getDayCenterVolunteerRequestSortValue,
        initialSortField: "created_at",
        initialSortDirection: "desc"
    });

    const emptyState = useMemo(() => {
        if (loading) {
            return null;
        }

        if (requests.length === 0) {
            return (
                <AdminListEmptyState
                    icon={ClipboardList}
                    title="אין בקשות ממתינות"
                    message="כאשר מתנדבים יגישו בקשה מהאתר, היא תופיע כאן לאישור."
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={ClipboardList}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש או את סינון הסטטוס."
                />
            );
        }

        return null;
    }, [loading, requests.length, list.totalFiltered]);

    return (
        <div className="day-center-volunteers-list day-center-volunteers-list--requests admin-list-section">
            <div className="admin-list-header admin-list-header--split">
                <h2 className="admin-list-header__title">בקשות מתנדבים</h2>
            </div>

            <AdminListToolbar
                layout="staff"
                searchId="day-center-volunteer-requests-search"
                searchLabel="חיפוש"
                searchPlaceholder="שם, זהות, טלפון או תוכן הבקשה"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="הצג בעמוד"
                filters={
                    <div className="admin-list-toolbar__filter-item">
                        <label htmlFor="day-center-volunteer-requests-status">
                            סטטוס
                        </label>
                        <select
                            id="day-center-volunteer-requests-status"
                            value={statusFilter}
                            onChange={(event) =>
                                onStatusFilterChange?.(event.target.value)
                            }
                        >
                            <option value={REQUEST_STATUS_PENDING}>
                                ממתין לאישור
                            </option>
                            <option value="">הכל</option>
                            <option value="approved">אושר</option>
                            <option value="rejected">נדחה</option>
                        </select>
                    </div>
                }
            />

            <AdminListSummary
                totalCount={list.totalCount}
                totalFiltered={list.totalFiltered}
                pageCount={list.pageCount}
                page={list.page}
                totalPages={list.totalPages}
                showAll={list.showAll}
            />

            {error ? (
                <p className="staff-alert staff-alert--error">{error}</p>
            ) : null}
            {actionMessage ? (
                <p className="staff-alert staff-alert--success">{actionMessage}</p>
            ) : null}

            {loading ? (
                <p className="day-center-volunteers-list__loading">טוען...</p>
            ) : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <AdminResponsiveList
                        desktopTable={
                            <AdminDataTable
                                ariaLabel="טבלת בקשות מתנדבי מרכז יום"
                                compact
                                columns={REQUEST_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((request) => (
                                    <tr key={request.id}>
                                        <td className="admin-data-table__name-cell">
                                            {getRequestDisplayName(request)}
                                        </td>
                                        <td className="admin-data-table__numeric">
                                            {request.phone || "—"}
                                        </td>
                                        <td>
                                            <span
                                                className={`day-center-volunteers-request-status day-center-volunteers-request-status--${request.status}`}
                                            >
                                                {getRequestStatusLabel(request.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="staff-button staff-button--small staff-button--secondary"
                                                onClick={() => onViewDetails?.(request)}
                                            >
                                                צפייה
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            />
                        }
                        mobileCards={
                            <div className="day-center-volunteers-cards">
                                {list.pageItems.map((request) => (
                                    <VolunteerRequestCard
                                        key={request.id}
                                        request={request}
                                        onViewDetails={onViewDetails}
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

export default VolunteerRequestList;
