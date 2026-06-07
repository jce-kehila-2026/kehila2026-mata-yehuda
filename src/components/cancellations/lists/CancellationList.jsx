import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban } from "lucide-react";
import CancellationCard from "./CancellationCard";
import CancellationListStats from "../CancellationListStats";
import CancellationRefundStatusBadge from "../CancellationRefundStatusBadge";
import {
    CancellationDetailModal,
    CancellationEditModal,
    CancellationRefundModal
} from "../CancellationModals";
import {
    computeCancellationListStats,
    formatCancellationDate,
    formatPaymentAmount,
    formatPaymentMethodLabel,
    REFUND_FILTERS,
    REFUND_STATUS_REFUNDED
} from "../helpers/cancellationHelpers";
import AdminDataTable from "../../admin/AdminDataTable";
import AdminListEmptyState from "../../admin/AdminListEmptyState";
import AdminListPagination from "../../admin/AdminListPagination";
import AdminListSummary from "../../admin/AdminListSummary";
import AdminListToolbar from "../../admin/AdminListToolbar";
import AdminResponsiveList from "../../admin/AdminResponsiveList";
import {
    AdminTableActions,
    AdminTableEditButton,
    AdminTableProcessButton,
    AdminTableViewButton
} from "../../admin/AdminTableActions";
import { ProgramDisplayName } from "../../participants/ParticipantListStats";
import { useAdminList } from "../../../hooks/useAdminList";
import {
    countCancellationRecords,
    filterCancellationsList,
    getCancellationRequests,
    getCancellationSortValue,
    updateRefundStatus
} from "../../../services/cancellationService";
import {
    resolveCanonicalProgramId,
    resolveProgramDisplayTitle
} from "../../../utils/programConstants";

const CANCELLATION_COLUMNS = [
    { key: "participant", label: "שם משתתף", sortKey: "participant" },
    { key: "program", label: "תוכנית", sortKey: "program" },
    { key: "activity", label: "פעילות", sortKey: "activity" },
    { key: "amount", label: "סכום", sortKey: "amount" },
    { key: "payment_method", label: "אמצעי תשלום", sortKey: "payment_method" },
    { key: "refund_status", label: "סטטוס החזר", sortKey: "refund_status" },
    { key: "cancelled_at", label: "תאריך ביטול", sortKey: "cancelled_at" },
    { key: "actions", label: "פעולות" }
];

function buildProgramFilterOptions(items) {
    const programs = new Map();

    items.forEach((item) => {
        const programId = resolveCanonicalProgramId(item.programId);

        if (!programId) {
            return;
        }

        if (!programs.has(programId)) {
            programs.set(
                programId,
                resolveProgramDisplayTitle(null, programId) ||
                    item.programTitle ||
                    programId
            );
        }
    });

    return Array.from(programs.entries()).map(([value, label]) => ({
        value,
        label
    }));
}

function CancellationList() {
    const [sourceItems, setSourceItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewItem, setViewItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [refundItem, setRefundItem] = useState(null);

    const filterItems = useCallback(
        (items, searchQuery, filters) =>
            filterCancellationsList(items, searchQuery, filters),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount,
        getSortValue: getCancellationSortValue,
        initialSortField: "cancelled_at",
        initialSortDirection: "desc"
    });

    const filteredItems = useMemo(
        () => filterCancellationsList(sourceItems, list.searchQuery, list.filters),
        [sourceItems, list.searchQuery, list.filters]
    );

    const cancellationStats = useMemo(
        () => computeCancellationListStats(filteredItems),
        [filteredItems]
    );

    const programFilterOptions = useMemo(
        () => buildProgramFilterOptions(sourceItems),
        [sourceItems]
    );

    async function loadCancellations() {
        setLoading(true);
        setError("");

        try {
            const [records, count] = await Promise.all([
                getCancellationRequests(),
                countCancellationRecords()
            ]);

            setSourceItems(records);
            setTotalCount(count);
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת בקשות הביטול");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCancellations();
    }, []);

    async function handleUpdateRefund(cancellationId, payload) {
        await updateRefundStatus(cancellationId, payload);
        await loadCancellations();
    }

    async function handleMarkRefunded(cancellationId, payload) {
        await handleUpdateRefund(cancellationId, payload);
    }

    function renderCancellationActions(item) {
        const isRefunded =
            item.cancellation.refund_status === REFUND_STATUS_REFUNDED;

        return (
            <AdminTableActions>
                <AdminTableViewButton
                    onClick={() => setViewItem(item)}
                    label="צפייה בפרטי ביטול"
                />
                <AdminTableProcessButton
                    onClick={() => setRefundItem(item)}
                    label="עיבוד החזר"
                    disabled={isRefunded}
                />
                <AdminTableEditButton
                    onClick={() => setEditItem(item)}
                    label="עריכת בקשת ביטול"
                />
            </AdminTableActions>
        );
    }

    const toolbarFilters = (
        <>
            <div className="admin-list-toolbar__filter-item">
                <label htmlFor="cancellation-program-filter">תוכנית</label>
                <select
                    id="cancellation-program-filter"
                    value={list.filters.programFilter || ""}
                    onChange={(event) =>
                        list.setFilter("programFilter", event.target.value)
                    }
                >
                    <option value="">כל התוכניות</option>
                    {programFilterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-list-toolbar__filter-item">
                <label htmlFor="cancellation-refund-filter">סטטוס החזר</label>
                <select
                    id="cancellation-refund-filter"
                    value={list.filters.refundFilter || ""}
                    onChange={(event) =>
                        list.setFilter("refundFilter", event.target.value)
                    }
                >
                    {REFUND_FILTERS.map((filter) => (
                        <option key={filter.id} value={filter.id}>
                            {filter.label}
                        </option>
                    ))}
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
                    icon={Ban}
                    title="אין בקשות ביטול"
                    message="כאשר יתקבלו בקשות ביטול חדשות, הן יופיעו כאן לניהול והחזרים."
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={Ban}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש או את הסינון כדי למצוא בקשות ביטול אחרות."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered]);

    return (
        <div className="staff-list-section admin-list-section admin-list-section--cancellations">
            <div className="admin-list-header admin-list-header--split">
                <h2 className="admin-list-header__title">רשימת ביטולים</h2>
            </div>

            <AdminListToolbar
                layout="cancellations"
                searchId="cancellation-search"
                searchLabel="חיפוש"
                searchPlaceholder="שם משתתף או טלפון"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                filters={toolbarFilters}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="הצג בעמוד"
            />

            <AdminListSummary
                totalCount={list.totalCount}
                totalFiltered={list.totalFiltered}
                pageCount={list.pageCount}
                page={list.page}
                totalPages={list.totalPages}
                showAll={list.showAll}
            />

            {!loading && filteredItems.length > 0 ? (
                <CancellationListStats stats={cancellationStats} />
            ) : null}

            {error ? (
                <p className="staff-alert staff-alert--error">{error}</p>
            ) : null}

            {loading ? <p>טוען...</p> : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <AdminResponsiveList
                        desktopTable={
                            <AdminDataTable
                                ariaLabel="טבלת ביטולים"
                                compact
                                columns={CANCELLATION_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((item) => (
                                    <tr key={item.cancellation.id}>
                                        <td className="admin-data-table__name-cell">
                                            {item.participantFullName || "—"}
                                        </td>
                                        <td>
                                            <ProgramDisplayName
                                                title={item.programTitle || "—"}
                                            />
                                        </td>
                                        <td>
                                            {item.showActivity
                                                ? item.activityName || "—"
                                                : "—"}
                                        </td>
                                        <td className="admin-data-table__numeric">
                                            {formatPaymentAmount(item.paymentDisplay)}
                                        </td>
                                        <td>
                                            {formatPaymentMethodLabel(
                                                item.paymentDisplay?.payment_method ||
                                                    item.paymentDisplay?.payment_status
                                            )}
                                        </td>
                                        <td>
                                            <CancellationRefundStatusBadge
                                                status={item.cancellation.refund_status}
                                            />
                                        </td>
                                        <td className="admin-data-table__numeric">
                                            {formatCancellationDate(
                                                item.cancellation.cancelled_at
                                            )}
                                        </td>
                                        <td>{renderCancellationActions(item)}</td>
                                    </tr>
                                ))}
                            />
                        }
                        mobileCards={
                            <div className="cancellations-list staff-grid staff-grid--cards">
                                {list.pageItems.map((item) => (
                                    <CancellationCard
                                        key={item.cancellation.id}
                                        item={item}
                                        onView={setViewItem}
                                        onEdit={setEditItem}
                                        onProcessRefund={setRefundItem}
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

            {viewItem ? (
                <CancellationDetailModal
                    item={viewItem}
                    onClose={() => setViewItem(null)}
                />
            ) : null}
            {editItem ? (
                <CancellationEditModal
                    item={editItem}
                    onClose={() => setEditItem(null)}
                    onSave={handleUpdateRefund}
                />
            ) : null}
            {refundItem ? (
                <CancellationRefundModal
                    item={refundItem}
                    onClose={() => setRefundItem(null)}
                    onMarkRefunded={handleMarkRefunded}
                />
            ) : null}
        </div>
    );
}

export default CancellationList;
