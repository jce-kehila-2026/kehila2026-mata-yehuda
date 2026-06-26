import { useCallback, useMemo } from "react";
import { ClipboardList } from "lucide-react";
import RegistrationCard from "./RegistrationCard";
import ParticipantStatusBadge from "../ParticipantStatusBadge";
import {
    MaskedIdDisplay,
    ProgramDisplayName
} from "../ParticipantListStats";
import AdminDataTable from "../../admin/AdminDataTable";
import AdminListEmptyState from "../../admin/AdminListEmptyState";
import AdminListToolbar from "../../admin/AdminListToolbar";
import AdminResponsiveList from "../../admin/AdminResponsiveList";
import { useAdminList } from "../../../hooks/useAdminList";
import {
    DAY_CENTER_ID,
    DAY_CENTER_NAME,
    PROGRAM_60_PLUS_MINUS_DISPLAY_NAME,
    PROGRAM_60_PLUS_MINUS_ID
} from "../../../utils/staffManegmentUtils/programConstants";
import { maskIdNumber } from "../../../utils/staffManegmentUtils/maskIdNumber";
import { toSafeString } from "../../../utils/staffManegmentUtils/participantStatusLabels";
import { hasValue } from "../../../utils/staffManegmentUtils/hasValue";

const PROGRAM_FILTER_ALL = "all";

const REGISTRATION_COLUMNS = [
    { key: "name", label: "שם", sortKey: "name" },
    { key: "id_number", label: "תעודת זהות", sortKey: "id_number" },
    { key: "phone", label: "טלפון", sortKey: "phone" },
    { key: "program", label: "תוכנית", sortKey: "program" },
    { key: "activity", label: "פעילות", sortKey: "activity" },
    { key: "status", label: "סטטוס הרשמה", sortKey: "status" },
    { key: "actions", label: "פעולה" }
];

function filterRegistrationList(items, searchQuery) {
    const query = String(searchQuery ?? "").trim().toLowerCase();

    if (!query) {
        return items;
    }

    return items.filter((registration) => {
        const name = String(registration.full_name ?? "").toLowerCase();
        const idNumber = String(registration.id_number ?? "").toLowerCase();
        const phone = String(registration.phone ?? "").toLowerCase();

        return (
            name.includes(query) ||
            idNumber.includes(query) ||
            phone.includes(query)
        );
    });
}

function getRegistrationSortValue(registration, field) {
    switch (field) {
        case "name":
            return registration.full_name || "";
        case "id_number":
            return registration.id_number || "";
        case "phone":
            return registration.phone || "";
        case "program":
            return registration.program_title || "";
        case "activity":
            return registration.activity_name || "";
        case "status":
            return registration.registration_status || "";
        default:
            return "";
    }
}

function RegistrationListStats({ count }) {
    if (!count) {
        return null;
    }

    return (
        <div className="list-mgmt-summary" aria-label="סיכום בקשות">
            <div className="list-mgmt-summary__item">
                <span className="list-mgmt-summary__icon" aria-hidden="true">
                    <ClipboardList
                        className="list-mgmt-summary__icon-glyph"
                        strokeWidth={2}
                    />
                </span>
                <span className="list-mgmt-summary__value">{count}</span>
                <span className="list-mgmt-summary__label">בקשות ממתינות</span>
            </div>
        </div>
    );
}

function RegistrationList({
    registrations,
    loading,
    error,
    activities,
    programFilter,
    activityFilter,
    onProgramFilterChange,
    onActivityFilterChange,
    onCompleteRegistration
}) {
    const filterItems = useCallback(
        (items, searchQuery) => filterRegistrationList(items, searchQuery),
        []
    );

    const list = useAdminList({
        sourceItems: registrations,
        filterItems,
        totalCount: registrations.length,
        getSortValue: getRegistrationSortValue,
        initialSortField: "name"
    });

    const showActivityFilter = programFilter === PROGRAM_60_PLUS_MINUS_ID;

    const emptyState = useMemo(() => {
        if (loading) {
            return null;
        }

        if (registrations.length === 0) {
            return (
                <AdminListEmptyState
                    icon={ClipboardList}
                    title="אין בקשות ממתינות"
                    message="כאשר יתקבלו בקשות רישום חדשות, הן יופיעו כאן להשלמה."
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={ClipboardList}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש או את הסינון כדי למצוא בקשות אחרות."
                />
            );
        }

        return null;
    }, [loading, registrations.length, list.totalFiltered]);

    return (
        <div className="staff-list-section admin-list-section admin-list-section--registrations">
            {!loading && list.totalFiltered > 0 ? (
                <RegistrationListStats count={list.totalFiltered} />
            ) : null}

            <AdminListToolbar
                searchId="registration-search"
                searchLabel="חיפוש"
                searchPlaceholder="שם, ת.ז. או טלפון"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="הצג בעמוד"
                pageSizeOptions={[5, 10, 20]}
                filters={
                    <>
                        <div className="admin-list-toolbar__filter-item">
                            <label htmlFor="registrations-program-filter">תוכנית</label>
                            <select
                                id="registrations-program-filter"
                                value={programFilter}
                                onChange={(event) =>
                                    onProgramFilterChange(event.target.value)
                                }
                            >
                                <option value={PROGRAM_FILTER_ALL}>הכל</option>
                                <option value={DAY_CENTER_ID}>{DAY_CENTER_NAME}</option>
                                <option value={PROGRAM_60_PLUS_MINUS_ID}>
                                    {PROGRAM_60_PLUS_MINUS_DISPLAY_NAME}
                                </option>
                            </select>
                        </div>
                        {showActivityFilter ? (
                            <div className="admin-list-toolbar__filter-item">
                                <label htmlFor="registrations-activity-filter">
                                    פעילות
                                </label>
                                <select
                                    id="registrations-activity-filter"
                                    value={activityFilter}
                                    onChange={(event) =>
                                        onActivityFilterChange(event.target.value)
                                    }
                                >
                                    <option value="">כל הפעילויות</option>
                                    {activities.map((activity) => (
                                        <option key={activity.id} value={activity.id}>
                                            {activity.data?.name ||
                                                activity.name ||
                                                "ללא שם"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}
                    </>
                }
            />

            {error ? (
                <p className="staff-alert staff-alert--error">{error}</p>
            ) : null}

            {loading ? <p className="list-mgmt-loading">טוען...</p> : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <div className="list-mgmt-list">
                    <AdminResponsiveList
                        desktopTable={
                            <AdminDataTable
                                ariaLabel="טבלת בקשות רישום"
                                compact
                                columns={REGISTRATION_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((registration) => {
                                    const programLabel =
                                        registration.program_title || "—";
                                    const showActivity =
                                        Boolean(
                                            String(
                                                registration.activity_id || ""
                                            ).trim()
                                        ) && hasValue(registration.activity_name);

                                    return (
                                        <tr
                                            key={
                                                registration.registrationId ||
                                                registration.id
                                            }
                                        >
                                            <td className="admin-data-table__name-cell">
                                                {registration.full_name || "—"}
                                            </td>
                                            <td className="admin-data-table__numeric">
                                                {hasValue(registration.id_number) ? (
                                                    <MaskedIdDisplay
                                                        idNumber={maskIdNumber(
                                                            registration.id_number
                                                        )}
                                                    />
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="admin-data-table__numeric">
                                                {toSafeString(registration.phone) ||
                                                    "—"}
                                            </td>
                                            <td>
                                                <ProgramDisplayName
                                                    title={programLabel}
                                                />
                                            </td>
                                            <td>
                                                {showActivity
                                                    ? registration.activity_name
                                                    : "—"}
                                            </td>
                                            <td>
                                                <ParticipantStatusBadge
                                                    type="registration"
                                                    status={
                                                        registration.registration_status
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="admin-registrations-table__complete"
                                                    onClick={() =>
                                                        onCompleteRegistration(
                                                            registration
                                                        )
                                                    }
                                                >
                                                    השלמת רישום
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            />
                        }
                        mobileCards={
                            <div className="registrations-list staff-grid staff-grid--cards">
                                {list.pageItems.map((registration) => (
                                    <RegistrationCard
                                        key={
                                            registration.registrationId ||
                                            registration.id
                                        }
                                        registration={registration}
                                        onCompleteRegistration={
                                            onCompleteRegistration
                                        }
                                    />
                                ))}
                            </div>
                        }
                    />
                    </div>

                    {list.totalPages > 1 ? (
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
                    ) : null}
                </>
            ) : null}
        </div>
    );
}

export default RegistrationList;
