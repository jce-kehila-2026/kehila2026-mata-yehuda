import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ClipboardList, Eye, X } from "lucide-react";
import AdminDataTable from "../admin/AdminDataTable";
import AdminListEmptyState from "../admin/AdminListEmptyState";
import AdminListToolbar from "../admin/AdminListToolbar";
import AdminResponsiveList from "../admin/AdminResponsiveList";
import { AdminTableActions } from "../admin/AdminTableActions";
import StaffConfirmModal from "../staff/StaffConfirmModal";
import { useAdminList } from "../../hooks/useAdminList";
import {
    approveDayCenterVolunteerRequest,
    filterDayCenterVolunteerRequestsList,
    formatRequestTimestamp,
    getDayCenterVolunteerRequestSortValue,
    getPendingDayCenterVolunteerRequests,
    getRequestDisplayName,
    getRequestStatusLabel,
    rejectDayCenterVolunteerRequest,
    REQUEST_STATUS_PENDING
} from "../../services/dayCenterVolunteerRequestService";
import DayCenterVolunteerRequestCompactCard from "./DayCenterVolunteerRequestCompactCard";
import VolunteerRequestDetailsModal from "./VolunteerRequestDetailsModal";

const REQUEST_COLUMNS = [
    { key: "name", label: "שם", sortKey: "name" },
    { key: "id_number", label: "ת.ז." },
    { key: "phone", label: "טלפון", sortKey: "phone" },
    { key: "created_at", label: "תאריך הגשה", sortKey: "created_at" },
    { key: "status", label: "סטטוס", sortKey: "status" },
    { key: "actions", label: "פעולות" }
];

function DayCenterVolunteerRequestsList({
    refreshKey = 0,
    onRequestUpdated,
    onShowError
}) {
    const [sourceItems, setSourceItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [detailsRequest, setDetailsRequest] = useState(null);
    const [pendingActionRequest, setPendingActionRequest] = useState(null);
    const [pendingActionType, setPendingActionType] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [modalError, setModalError] = useState("");

    const filterItems = useCallback(
        (items, searchQuery) =>
            filterDayCenterVolunteerRequestsList(
                items,
                searchQuery,
                REQUEST_STATUS_PENDING
            ),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount: sourceItems.length,
        getSortValue: getDayCenterVolunteerRequestSortValue,
        initialSortField: "created_at",
        initialSortDirection: "desc"
    });

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const records = await getPendingDayCenterVolunteerRequests();
            setSourceItems(records);
        } catch (loadError) {
            console.error(loadError);
            setError("שגיאה בטעינת בקשות מתנדבים");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests, refreshKey]);

    function openApproveConfirm(request) {
        setModalError("");
        setPendingActionRequest(request);
        setPendingActionType("approve");
    }

    function openRejectConfirm(request) {
        setModalError("");
        setPendingActionRequest(request);
        setPendingActionType("reject");
    }

    function handleViewDetails(request) {
        setModalError("");
        setDetailsRequest(request);
    }

    async function handleConfirmAction() {
        if (!pendingActionRequest || !pendingActionType) {
            return;
        }

        setIsProcessing(true);
        setModalError("");

        try {
            if (pendingActionType === "approve") {
                await approveDayCenterVolunteerRequest(pendingActionRequest.id);
                onRequestUpdated?.({
                    successMessage: "הבקשה אושרה והמתנדב/ת נוסף/ה לרשימה"
                });
            } else {
                await rejectDayCenterVolunteerRequest(pendingActionRequest.id);
                onRequestUpdated?.({ successMessage: "הבקשה נדחתה" });
            }

            setPendingActionRequest(null);
            setPendingActionType(null);
            setDetailsRequest(null);
            await loadRequests();
        } catch (actionError) {
            console.error(actionError);
            onShowError?.("אירעה שגיאה. נסו שוב.");
        } finally {
            setIsProcessing(false);
        }
    }

    const emptyState = useMemo(() => {
        if (loading) {
            return null;
        }

        if (sourceItems.length === 0) {
            return (
                <AdminListEmptyState
                    icon={ClipboardList}
                    title="אין בקשות ממתינות"
                    message="בקשות התנדבות חדשות יופיעו כאן וניתן יהיה לאשר או לדחות אותן."
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={ClipboardList}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש כדי למצוא בקשות אחרות."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered]);

    function renderRequestActions(request) {
        return (
            <AdminTableActions>
                <button
                    type="button"
                    className="admin-table-action admin-table-action--view"
                    onClick={() => handleViewDetails(request)}
                    disabled={isProcessing}
                    title="צפייה"
                    aria-label="צפייה"
                >
                    <Eye
                        className="admin-table-action__icon"
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                </button>
                <button
                    type="button"
                    className="admin-table-action admin-table-action--edit"
                    onClick={() => openApproveConfirm(request)}
                    disabled={isProcessing}
                    title="אישור"
                    aria-label="אישור"
                >
                    <Check
                        className="admin-table-action__icon"
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                </button>
                <button
                    type="button"
                    className="admin-table-action admin-table-action--delete"
                    onClick={() => openRejectConfirm(request)}
                    disabled={isProcessing}
                    title="דחייה"
                    aria-label="דחייה"
                >
                    <X
                        className="admin-table-action__icon"
                        strokeWidth={2}
                        aria-hidden="true"
                    />
                </button>
            </AdminTableActions>
        );
    }

    return (
        <div className="staff-list-section admin-list-section admin-list-section--day-center-volunteer-requests">
            <AdminListToolbar
                searchId="day-center-volunteer-requests-search"
                searchLabel="חיפוש"
                searchPlaceholder="שם, זהות, טלפון או תוכן הבקשה"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="הצג בעמוד"
                pageSizeOptions={[5, 10, 20]}
            />

            {error ? (
                <p className="staff-alert staff-alert--error">{error}</p>
            ) : null}

            {loading ? (
                <p className="list-mgmt-loading">טוען בקשות...</p>
            ) : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <div className="list-mgmt-list">
                        <AdminResponsiveList
                            desktopTable={
                                <AdminDataTable
                                    ariaLabel="טבלת בקשות מתנדבים"
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
                                                {request.id_number || "—"}
                                            </td>
                                            <td className="admin-data-table__numeric">
                                                {request.phone || "—"}
                                            </td>
                                            <td className="admin-data-table__numeric">
                                                {formatRequestTimestamp(
                                                    request.created_at
                                                )}
                                            </td>
                                            <td className="day-center-volunteers-list__status-cell">
                                                <span
                                                    className={`day-center-volunteers-request-status day-center-volunteers-request-status--${request.status}`}
                                                >
                                                    {getRequestStatusLabel(
                                                        request.status
                                                    )}
                                                </span>
                                            </td>
                                            <td>{renderRequestActions(request)}</td>
                                        </tr>
                                    ))}
                                />
                            }
                            mobileCards={
                                <div className="day-center-volunteers-cards">
                                    {list.pageItems.map((request) => (
                                        <DayCenterVolunteerRequestCompactCard
                                            key={request.id}
                                            request={request}
                                            onViewDetails={handleViewDetails}
                                            onApprove={openApproveConfirm}
                                            onReject={openRejectConfirm}
                                            disabled={isProcessing}
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

            <VolunteerRequestDetailsModal
                request={detailsRequest}
                onClose={() => {
                    if (!isProcessing) {
                        setDetailsRequest(null);
                        setModalError("");
                    }
                }}
                onApprove={openApproveConfirm}
                onReject={openRejectConfirm}
                isProcessing={isProcessing}
                error={modalError}
            />

            <StaffConfirmModal
                message={
                    pendingActionRequest
                        ? pendingActionType === "approve"
                            ? `לאשר את בקשת ההתנדבות של ${getRequestDisplayName(pendingActionRequest)}?`
                            : `לדחות את בקשת ההתנדבות של ${getRequestDisplayName(pendingActionRequest)}?`
                        : ""
                }
                confirmLabel={
                    pendingActionType === "approve" ? "אישור" : "דחייה"
                }
                confirming={isProcessing}
                onConfirm={handleConfirmAction}
                onCancel={() => {
                    if (!isProcessing) {
                        setPendingActionRequest(null);
                        setPendingActionType(null);
                    }
                }}
            />
        </div>
    );
}

export default DayCenterVolunteerRequestsList;
