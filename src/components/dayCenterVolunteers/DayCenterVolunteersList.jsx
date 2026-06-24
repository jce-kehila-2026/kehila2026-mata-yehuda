import { useCallback, useEffect, useMemo, useState } from "react";
import CommunityStaffConfirmModal from "../communityStaff/CommunityStaffConfirmModal.jsx";
import {
    CommunityStaffEmptyState,
    CommunityStaffListToolbar,
    CommunityStaffPagination,
    CommunityStaffStatusOverview,
    Users,
    buildActiveInactiveOverviewItems
} from "../communityStaff/CommunityStaffListUi.jsx";
import {
    deactivateDayCenterVolunteer,
    filterDayCenterVolunteersList,
    getDayCenterVolunteers,
    reactivateDayCenterVolunteer,
    sortDayCenterVolunteersWithActiveFirst,
    VOLUNTEER_STATUS_FILTER_ACTIVE,
    VOLUNTEER_STATUS_FILTER_ALL,
    VOLUNTEER_STATUS_FILTER_INACTIVE
} from "../../services/dayCenterVolunteerService";
import DayCenterVolunteerCompactCard from "./DayCenterVolunteerCompactCard";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

const STATUS_FILTER_MAP = {
    all: VOLUNTEER_STATUS_FILTER_ALL,
    active: VOLUNTEER_STATUS_FILTER_ACTIVE,
    inactive: VOLUNTEER_STATUS_FILTER_INACTIVE
};

function DayCenterVolunteersList({
    refreshKey = 0,
    onEditVolunteer,
    onViewDetails,
    onVolunteerUpdated,
    onShowError,
    showOverview = false
}) {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [pendingActionVolunteer, setPendingActionVolunteer] = useState(null);
    const [pendingActionType, setPendingActionType] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadVolunteers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const records = await getDayCenterVolunteers();
            setVolunteers(records);
        } catch (loadError) {
            console.error(loadError);
            setError("שגיאה בטעינת מתנדבי מרכז היום");
            setVolunteers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVolunteers();
    }, [loadVolunteers, refreshKey]);

    const filteredVolunteers = useMemo(() => {
        const filtered = filterDayCenterVolunteersList(
            volunteers,
            searchTerm,
            STATUS_FILTER_MAP[statusFilter] || VOLUNTEER_STATUS_FILTER_ALL
        );

        return sortDayCenterVolunteersWithActiveFirst(filtered, "name", "asc");
    }, [volunteers, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredVolunteers.length / pageSize));

    const paginatedVolunteers = useMemo(() => {
        const safePage = Math.min(currentPage, totalPages);
        const startIndex = (safePage - 1) * pageSize;
        return filteredVolunteers.slice(startIndex, startIndex + pageSize);
    }, [filteredVolunteers, currentPage, pageSize, totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, pageSize]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

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
                onVolunteerUpdated?.({
                    successMessage: "המתנדב הושבת בהצלחה"
                });
            } else {
                await reactivateDayCenterVolunteer(pendingActionVolunteer.id);
                onVolunteerUpdated?.({
                    successMessage: "המתנדב הופעל בהצלחה"
                });
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

    if (loading) {
        return (
            <p className="community-volunteers-mgmt__loading">טוען מתנדבים...</p>
        );
    }

    if (error) {
        return <p className="community-volunteers-mgmt__error">{error}</p>;
    }

    return (
        <div className="community-volunteers-mgmt">
            {showOverview ? (
                <CommunityStaffStatusOverview
                    items={buildActiveInactiveOverviewItems(
                        volunteers,
                        (volunteer) => volunteer.is_active !== false
                    )}
                />
            ) : null}

            <CommunityStaffListToolbar
                searchId="day-center-volunteers-search"
                searchValue={searchTerm}
                onSearchChange={(event) => setSearchTerm(event.target.value)}
                searchPlaceholder="שם, תעודת זהות, טלפון או תוכן אישי"
                filterId="day-center-volunteers-status-filter"
                filterValue={statusFilter}
                onFilterChange={(event) => setStatusFilter(event.target.value)}
                filterLabel="סטטוס"
                filterOptions={[
                    { value: "all", label: "כל המתנדבים" },
                    { value: "active", label: "פעילים" },
                    { value: "inactive", label: "לא פעילים" }
                ]}
                pageSizeId="day-center-volunteers-page-size"
                pageSizeValue={pageSize}
                onPageSizeChange={(event) => setPageSize(Number(event.target.value))}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
            />

            <div className="community-staff-request-list community-volunteers-mgmt__card">
                {filteredVolunteers.length === 0 ? (
                    <CommunityStaffEmptyState
                        icon={Users}
                        message={
                            volunteers.length === 0
                                ? "אין מתנדבים במערכת"
                                : "לא נמצאו תוצאות לפי החיפוש או הסינון"
                        }
                    />
                ) : (
                    <ul className="community-staff-compact-list">
                        {paginatedVolunteers.map((volunteer) => (
                            <DayCenterVolunteerCompactCard
                                key={volunteer.id}
                                volunteer={volunteer}
                                onViewDetails={onViewDetails}
                                onEdit={onEditVolunteer}
                                onDeactivate={openDeactivateConfirm}
                                onReactivate={openReactivateConfirm}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {filteredVolunteers.length > 0 ? (
                <CommunityStaffPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    onNext={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                />
            ) : null}

            <CommunityStaffConfirmModal
                message={
                    pendingActionVolunteer
                        ? pendingActionType === "deactivate"
                            ? "להשבית את המתנדב/ה?"
                            : "להפעיל את המתנדב/ה מחדש?"
                        : null
                }
                onConfirm={handleConfirmAction}
                onCancel={() => {
                    setPendingActionVolunteer(null);
                    setPendingActionType(null);
                }}
                confirming={isProcessing}
            />
        </div>
    );
}

export default DayCenterVolunteersList;
