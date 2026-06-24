import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import CommunityStaffConfirmModal from "../communityStaff/CommunityStaffConfirmModal.jsx";
import {
    CommunityStaffEmptyState,
    CommunityStaffListToolbar,
    CommunityStaffPagination
} from "../communityStaff/CommunityStaffListUi.jsx";
import {
    approveDayCenterVolunteerRequest,
    filterDayCenterVolunteerRequestsList,
    getPendingDayCenterVolunteerRequests,
    getRequestDisplayName,
    rejectDayCenterVolunteerRequest,
    REQUEST_STATUS_PENDING
} from "../../services/dayCenterVolunteerRequestService";
import DayCenterVolunteerRequestCompactCard from "./DayCenterVolunteerRequestCompactCard";
import VolunteerRequestDetailsModal from "./VolunteerRequestDetailsModal";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

function DayCenterVolunteerRequestsList({
    refreshKey = 0,
    onRequestUpdated,
    onShowError
}) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailsRequest, setDetailsRequest] = useState(null);
    const [pendingActionRequest, setPendingActionRequest] = useState(null);
    const [pendingActionType, setPendingActionType] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [modalError, setModalError] = useState("");

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const records = await getPendingDayCenterVolunteerRequests();
            setRequests(records);
        } catch (loadError) {
            console.error(loadError);
            setError("שגיאה בטעינת בקשות מתנדבים");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests, refreshKey]);

    const filteredRequests = useMemo(() => {
        return filterDayCenterVolunteerRequestsList(
            requests,
            searchTerm,
            REQUEST_STATUS_PENDING
        );
    }, [requests, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));

    const paginatedRequests = useMemo(() => {
        const safePage = Math.min(currentPage, totalPages);
        const startIndex = (safePage - 1) * pageSize;
        return filteredRequests.slice(startIndex, startIndex + pageSize);
    }, [filteredRequests, currentPage, pageSize, totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, pageSize]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

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
                onRequestUpdated?.({
                    successMessage: "הבקשה נדחתה"
                });
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

    async function handleModalApprove(request) {
        openApproveConfirm(request);
    }

    async function handleModalReject(request) {
        openRejectConfirm(request);
    }

    if (loading) {
        return (
            <p className="community-volunteers-mgmt__loading">טוען בקשות...</p>
        );
    }

    if (error) {
        return <p className="community-volunteers-mgmt__error">{error}</p>;
    }

    return (
        <div className="community-volunteers-mgmt">
            <CommunityStaffListToolbar
                searchId="day-center-volunteer-requests-search"
                searchValue={searchTerm}
                onSearchChange={(event) => setSearchTerm(event.target.value)}
                searchPlaceholder="שם, זהות, טלפון או תוכן הבקשה"
                pageSizeId="day-center-volunteer-requests-page-size"
                pageSizeValue={pageSize}
                onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                showFilter={false}
            />

            <div className="community-staff-request-list community-volunteers-mgmt__card">
                {filteredRequests.length === 0 ? (
                    <CommunityStaffEmptyState
                        icon={ClipboardList}
                        message={
                            requests.length === 0
                                ? "אין בקשות ממתינות"
                                : "לא נמצאו תוצאות לפי החיפוש"
                        }
                    />
                ) : (
                    <ul className="community-staff-compact-list">
                        {paginatedRequests.map((request) => (
                            <DayCenterVolunteerRequestCompactCard
                                key={request.id}
                                request={request}
                                onViewDetails={handleViewDetails}
                                onApprove={openApproveConfirm}
                                onReject={openRejectConfirm}
                                disabled={isProcessing}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {filteredRequests.length > 0 ? (
                <CommunityStaffPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    onNext={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                />
            ) : null}

            <VolunteerRequestDetailsModal
                request={detailsRequest}
                onClose={() => {
                    if (!isProcessing) {
                        setDetailsRequest(null);
                        setModalError("");
                    }
                }}
                onApprove={handleModalApprove}
                onReject={handleModalReject}
                isProcessing={isProcessing}
                error={modalError}
            />

            <CommunityStaffConfirmModal
                message={
                    pendingActionRequest
                        ? pendingActionType === "approve"
                            ? `לאשר את בקשת ההתנדבות של ${getRequestDisplayName(pendingActionRequest)}?`
                            : pendingActionType === "reject"
                              ? `לדחות את בקשת ההתנדבות של ${getRequestDisplayName(pendingActionRequest)}?`
                              : null
                        : null
                }
                onConfirm={handleConfirmAction}
                onCancel={() => {
                    setPendingActionRequest(null);
                    setPendingActionType(null);
                }}
                confirming={isProcessing}
            />
        </div>
    );
}

export default DayCenterVolunteerRequestsList;
