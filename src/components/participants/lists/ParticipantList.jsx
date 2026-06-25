import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Plus, UserRound } from "lucide-react";
import ParticipantCard from "./ParticipantCard";
import ParticipantStatusBadge from "../ParticipantStatusBadge";
import {
    MaskedIdDisplay,
    ParticipantListStats,
    ProgramDisplayName
} from "../ParticipantListStats";
import AdminDataTable from "../../admin/AdminDataTable";
import AdminListEmptyState from "../../admin/AdminListEmptyState";
import AdminListPagination from "../../admin/AdminListPagination";
import AdminListSummary from "../../admin/AdminListSummary";
import AdminListToolbar from "../../admin/AdminListToolbar";
import AdminResponsiveList from "../../admin/AdminResponsiveList";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton,
    AdminTableViewButton
} from "../../admin/AdminTableActions";
import { useAdminList } from "../../../hooks/useAdminList";
import {
    countParticipantRecords,
    deleteParticipant,
    fetchParticipantsForAdminList,
    filterParticipantsList,
    getParticipantSortValue
} from "../../../services/staffManegmentServices/participantService";
import { fetchProgramsForAdminList } from "../../../services/staffManegmentServices/programService";
import { formatDate } from "../../../utils/staffManegmentUtils/dateUtils";
import { maskIdNumber } from "../../../utils/staffManegmentUtils/maskIdNumber";
import { computeParticipantListStats } from "../../../utils/staffManegmentUtils/participantListStats";
import {
    resolveCanonicalProgramId,
    resolveProgramDisplayTitle
} from "../../../utils/staffManegmentUtils/programConstants";
import {
    PAYMENT_STATUS_FILTER_OPTIONS,
    REGISTRATION_STATUS_FILTER_OPTIONS,
    toSafeString
} from "../../../utils/staffManegmentUtils/participantStatusLabels";
import { ARCHIVE_CONFIRM_MESSAGE } from "../../../utils/staffManegmentUtils/archiveUtils";
import StaffConfirmModal from "../../staff/StaffConfirmModal";
import { hasFormattedDisplay, hasValue } from "../../../utils/staffManegmentUtils/hasValue";

const PARTICIPANT_COLUMNS = [
    { key: "name", label: "שם", sortKey: "name" },
    { key: "id_number", label: "ת.ז.", sortKey: "id_number" },
    { key: "phone", label: "טלפון", sortKey: "phone" },
    { key: "program", label: "תוכנית", sortKey: "program" },
    {
        key: "registration_date",
        label: "תאריך הרשמה",
        sortKey: "registration_date"
    },
    { key: "status", label: "סטטוס הרשמה", sortKey: "status" },
    { key: "payment_status", label: "סטטוס תשלום", sortKey: "payment_status" },
    { key: "actions", label: "פעולות" }
];

function getParticipantFullName(participant) {
    if (!participant) {
        return "";
    }

    return [toSafeString(participant.first_name), toSafeString(participant.last_name)]
        .filter(Boolean)
        .join(" ");
}

function getProgramLabel(participant, programs = []) {
    const programId = resolveCanonicalProgramId(participant?.program_id);

    if (!programId) {
        return "—";
    }

    const program = programs.find((item) => item.id === programId);

    return resolveProgramDisplayTitle(program, programId) || "—";
}

function ParticipantList({
    refreshKey = 0,
    onEditParticipant,
    onAddParticipant,
    onViewArchive
}) {
    const [sourceItems, setSourceItems] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [pendingArchiveParticipant, setPendingArchiveParticipant] = useState(null);
    const [archiving, setArchiving] = useState(false);

    const filterItems = useCallback(
        (items, searchQuery, filters) =>
            filterParticipantsList(items, searchQuery, filters),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount,
        getSortValue: getParticipantSortValue,
        initialSortField: "name"
    });

    const filteredParticipants = useMemo(
        () => filterParticipantsList(sourceItems, list.searchQuery, list.filters),
        [sourceItems, list.searchQuery, list.filters, filterItems]
    );

    const participantStats = useMemo(
        () => computeParticipantListStats(filteredParticipants),
        [filteredParticipants]
    );

    async function loadParticipants() {
        setLoading(true);
        setError("");

        try {
            const [records, count, programRecords] = await Promise.all([
                fetchParticipantsForAdminList(),
                countParticipantRecords(),
                fetchProgramsForAdminList()
            ]);

            setSourceItems(records);
            setTotalCount(count);
            setPrograms(programRecords);
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת המשתתפים");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadParticipants();
    }, [refreshKey]);

    async function handleDeleteParticipant(participant) {
        setPendingArchiveParticipant(participant);
    }

    async function confirmArchiveParticipant() {
        if (!pendingArchiveParticipant) {
            return;
        }

        setArchiving(true);

        try {
            await deleteParticipant(pendingArchiveParticipant.id);
            setActionMessage("המשתתף הועבר לארכיון בהצלחה");
            await loadParticipants();
        } catch (err) {
            console.error(err);
            setError("שגיאה בהעברת המשתתף לארכיון");
        } finally {
            setArchiving(false);
            setPendingArchiveParticipant(null);
        }
    }

    function renderParticipantActions(participant) {
        return (
            <AdminTableActions>
                {onEditParticipant ? (
                    <>
                        <AdminTableViewButton
                            onClick={() => onEditParticipant(participant)}
                            label="צפייה בפרטי משתתף"
                        />
                        <AdminTableEditButton
                            onClick={() => onEditParticipant(participant)}
                            label="עריכת משתתף"
                        />
                    </>
                ) : null}
                <AdminTableDeleteButton
                    onClick={() => handleDeleteParticipant(participant)}
                    label="מחיקת משתתף"
                />
            </AdminTableActions>
        );
    }

    const toolbarFilters = (
        <>
            <div className="admin-list-toolbar__filter-item">
                <label htmlFor="participant-program-filter">תוכנית</label>
                <select
                    id="participant-program-filter"
                    value={list.filters.programFilter || ""}
                    onChange={(event) =>
                        list.setFilter("programFilter", event.target.value)
                    }
                >
                    <option value="">כל התוכניות</option>
                    {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                            {resolveProgramDisplayTitle(program, program.id)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-list-toolbar__filter-item">
                <label htmlFor="participant-status-filter">סטטוס הרשמה</label>
                <select
                    id="participant-status-filter"
                    value={list.filters.statusFilter || ""}
                    onChange={(event) =>
                        list.setFilter("statusFilter", event.target.value)
                    }
                >
                    <option value="">כל הסטטוסים</option>
                    {REGISTRATION_STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-list-toolbar__filter-item">
                <label htmlFor="participant-payment-filter">סטטוס תשלום</label>
                <select
                    id="participant-payment-filter"
                    value={list.filters.paymentFilter || ""}
                    onChange={(event) =>
                        list.setFilter("paymentFilter", event.target.value)
                    }
                >
                    <option value="">כל הסטטוסים</option>
                    <option value="__none__">ללא סטטוס תשלום</option>
                    {PAYMENT_STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
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
                    icon={UserRound}
                    title="אין משתתפים במערכת"
                    message="הוסיפו את המשתתף הראשון כדי להתחיל לנהל הרשמות ונוכחות."
                    actionLabel={onAddParticipant ? "הוספת משתתף" : undefined}
                    onAction={onAddParticipant}
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={UserRound}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש או את הסינון כדי למצוא משתתפים אחרים."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered, onAddParticipant]);

    return (
        <div className="staff-list-section admin-list-section admin-list-section--participants">
            <div className="admin-list-header admin-list-header--split">
                <h2 className="admin-list-header__title">רשימת משתתפים</h2>
                <div className="admin-list-header__actions">
                    {onViewArchive ? (
                        <button
                            type="button"
                            className="staff-button staff-button--secondary staff-button--small admin-list-header__action admin-list-header__action--compact"
                            onClick={onViewArchive}
                        >
                            <Archive
                                className="admin-list-header__action-icon"
                                strokeWidth={2.25}
                                aria-hidden="true"
                            />
                            <span>צפייה בארכיון</span>
                        </button>
                    ) : null}
                    {onAddParticipant ? (
                        <button
                            type="button"
                            className="staff-button staff-button--small admin-list-header__action admin-list-header__action--compact"
                            onClick={onAddParticipant}
                        >
                            <Plus
                                className="admin-list-header__action-icon"
                                strokeWidth={2.25}
                                aria-hidden="true"
                            />
                            <span>הוספת משתתף</span>
                        </button>
                    ) : null}
                </div>
            </div>

            <AdminListToolbar
                layout="participants"
                searchId="participant-search"
                searchLabel="חיפוש"
                searchPlaceholder="שם, שם משפחה, ת.ז. או טלפון"
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

            {!loading && filteredParticipants.length > 0 ? (
                <ParticipantListStats stats={participantStats} />
            ) : null}

            {error ? (
                <p className="staff-alert staff-alert--error">{error}</p>
            ) : null}
            {actionMessage ? (
                <p className="staff-alert staff-alert--success">{actionMessage}</p>
            ) : null}

            {loading ? <p>טוען...</p> : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <AdminResponsiveList
                        desktopTable={
                            <AdminDataTable
                                ariaLabel="טבלת משתתפים"
                                compact
                                columns={PARTICIPANT_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((participant) => {
                                    const fullName =
                                        getParticipantFullName(participant) || "—";
                                    const programLabel = getProgramLabel(
                                        participant,
                                        programs
                                    );
                                    const registrationDate = formatDate(
                                        participant.registered_at
                                    );

                                    return (
                                        <tr key={participant.id}>
                                            <td className="admin-data-table__name-cell">
                                                {fullName}
                                            </td>
                                            <td className="admin-data-table__numeric">
                                                <MaskedIdDisplay
                                                    idNumber={maskIdNumber(
                                                        participant.id_number
                                                    )}
                                                />
                                            </td>
                                            <td className="admin-data-table__numeric">
                                                {toSafeString(participant.phone) || "—"}
                                            </td>
                                            <td>
                                                <ProgramDisplayName title={programLabel} />
                                            </td>
                                            <td className="admin-data-table__numeric">
                                                {hasFormattedDisplay(registrationDate)
                                                    ? registrationDate
                                                    : "—"}
                                            </td>
                                            <td>
                                                <ParticipantStatusBadge
                                                    type="registration"
                                                    status={
                                                        participant.registration_status
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <ParticipantStatusBadge
                                                    type="payment"
                                                    status={participant.payment_status}
                                                />
                                            </td>
                                            <td>{renderParticipantActions(participant)}</td>
                                        </tr>
                                    );
                                })}
                            />
                        }
                        mobileCards={
                            <div className="participants-list staff-grid staff-grid--cards">
                                {list.pageItems.map((participant) => (
                                    <ParticipantCard
                                        key={participant.id}
                                        participant={participant}
                                        programs={programs}
                                        onEdit={onEditParticipant}
                                        onView={onEditParticipant}
                                        onDelete={handleDeleteParticipant}
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

            <StaffConfirmModal
                message={pendingArchiveParticipant ? ARCHIVE_CONFIRM_MESSAGE : ""}
                confirmLabel="העברה לארכיון"
                confirming={archiving}
                onConfirm={confirmArchiveParticipant}
                onCancel={() => {
                    if (!archiving) {
                        setPendingArchiveParticipant(null);
                    }
                }}
            />
        </div>
    );
}

export default ParticipantList;
