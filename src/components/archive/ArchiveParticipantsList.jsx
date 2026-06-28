import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive } from "lucide-react";
import ParticipantStatusBadge from "../participants/ParticipantStatusBadge";
import { MaskedIdDisplay } from "../participants/ParticipantListStats";
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
    fetchArchivedParticipantsForAdminList,
    filterParticipantsList,
    getParticipantSortValue,
    permanentlyDeleteParticipantRecord,
    restoreParticipantRecord
} from "../../services/staffManegmentServices/participantService";
import { fetchProgramsForAdminList } from "../../services/staffManegmentServices/programService";
import { PERMANENT_DELETE_CONFIRM_MESSAGE } from "../../utils/staffManegmentUtils/archiveUtils";
import { formatDate } from "../../utils/staffManegmentUtils/dateUtils";
import {
    resolveCanonicalProgramId,
    resolveProgramDisplayTitle
} from "../../utils/staffManegmentUtils/programConstants";
import { toSafeString } from "../../utils/staffManegmentUtils/participantStatusLabels";

const ARCHIVE_PARTICIPANT_COLUMNS = [
    { key: "name", label: "שם", sortKey: "name" },
    { key: "id_number", label: "ת.ז.", sortKey: "id_number" },
    { key: "phone", label: "טלפון", sortKey: "phone" },
    { key: "program", label: "תוכנית", sortKey: "program" },
    { key: "archivedAt", label: "תאריך העברה לארכיון" },
    { key: "status", label: "סטטוס הרשמה", sortKey: "status" },
    { key: "actions", label: "פעולות" }
];

function getParticipantFullName(participant) {
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

function ArchiveParticipantsList({ refreshKey = 0, onActionMessage }) {
    const [sourceItems, setSourceItems] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const confirm = useStaffConfirmAction();

    const filterItems = useCallback(
        (items, searchQuery, filters) =>
            filterParticipantsList(items, searchQuery, filters),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount: sourceItems.length,
        getSortValue: getParticipantSortValue,
        initialSortField: "name"
    });

    async function loadArchivedParticipants() {
        setLoading(true);
        setLoadError("");

        try {
            const [records, programRecords] = await Promise.all([
                fetchArchivedParticipantsForAdminList(),
                fetchProgramsForAdminList()
            ]);

            setSourceItems(records);
            setPrograms(programRecords);
        } catch (error) {
            console.error(error);
            setLoadError("שגיאה בטעינת משתתפים מהארכיון");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadArchivedParticipants();
    }, [refreshKey]);

    function handleRestore(participant) {
        confirm.requestAction({
            message: "האם לשחזר את המשתתף מהארכיון?",
            confirmLabel: "שחזור",
            action: async () => {
                await restoreParticipantRecord(participant);
                onActionMessage?.("המשתתף שוחזר בהצלחה");
                await loadArchivedParticipants();
            }
        });
    }

    function handlePermanentDelete(participant) {
        confirm.requestAction({
            message: PERMANENT_DELETE_CONFIRM_MESSAGE,
            confirmLabel: "מחיקה סופית",
            action: async () => {
                await permanentlyDeleteParticipantRecord(participant);
                onActionMessage?.("המשתתף נמחק לצמיתות");
                await loadArchivedParticipants();
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
                    title="אין משתתפים בארכיון"
                    message="משתתפים שהועברו לארכיון יופיעו כאן."
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={Archive}
                    title="אין פריטים בארכיון"
                    message="נסו לשנות את החיפוש כדי למצוא משתתפים אחרים בארכיון."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered]);

    function renderActions(participant) {
        return (
            <AdminTableActions>
                <AdminTableRestoreButton
                    onClick={() => handleRestore(participant)}
                    label="שחזור משתתף"
                />
                <AdminTableDeleteButton
                    onClick={() => handlePermanentDelete(participant)}
                    label="מחיקה סופית"
                />
            </AdminTableActions>
        );
    }

    return (
        <div className="staff-list-section admin-list-section admin-list-section--archive-participants">
            <div className="admin-list-header">
                <h2 className="admin-list-header__title">ארכיון משתתפים</h2>
            </div>

            <AdminListToolbar
                searchId="archive-participant-search"
                searchLabel="חיפוש"
                searchPlaceholder="חיפוש לפי שם, ת.ז. או טלפון"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="מספר משתתפים בעמוד"
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
                                ariaLabel="טבלת משתתפים בארכיון"
                                compact
                                columns={ARCHIVE_PARTICIPANT_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((participant) => (
                                    <tr key={participant.id}>
                                        <td>{getParticipantFullName(participant) || "—"}</td>
                                        <td>
                                            <MaskedIdDisplay
                                                idNumber={
                                                    toSafeString(
                                                        participant.id_number
                                                    ) || "—"
                                                }
                                            />
                                        </td>
                                        <td>{toSafeString(participant.phone) || "—"}</td>
                                        <td>{getProgramLabel(participant, programs)}</td>
                                        <td>{formatDate(participant.archivedAt) || "—"}</td>
                                        <td>
                                            <ParticipantStatusBadge
                                                status={participant.registration_status}
                                            />
                                        </td>
                                        <td>{renderActions(participant)}</td>
                                    </tr>
                                ))}
                            />
                        }
                        mobileCards={
                            <div className="participants-list staff-grid staff-grid--cards">
                                {list.pageItems.map((participant) => (
                                    <article
                                        key={participant.id}
                                        className="participant-card staff-card archive-card"
                                    >
                                        <div className="staff-card-body">
                                            <h3>{getParticipantFullName(participant) || "—"}</h3>
                                            <p>
                                                ת.ז.:{" "}
                                                <MaskedIdDisplay
                                                    idNumber={
                                                        toSafeString(
                                                            participant.id_number
                                                        ) || "—"
                                                    }
                                                />
                                            </p>
                                            <p>
                                                טלפון:{" "}
                                                {toSafeString(participant.phone) || "—"}
                                            </p>
                                            <p>
                                                תוכנית:{" "}
                                                {getProgramLabel(participant, programs)}
                                            </p>
                                            <p>
                                                תאריך העברה לארכיון:{" "}
                                                {formatDate(participant.archivedAt) || "—"}
                                            </p>
                                            <p>
                                                סטטוס:{" "}
                                                <ParticipantStatusBadge
                                                    status={
                                                        participant.registration_status
                                                    }
                                                />
                                            </p>
                                        </div>
                                        <div className="archive-card__actions">
                                            {renderActions(participant)}
                                        </div>
                                    </article>
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
                message={confirm.pendingAction?.message}
                confirmLabel={confirm.pendingAction?.confirmLabel}
                confirming={confirm.processing}
                onConfirm={confirm.confirm}
                onCancel={confirm.cancel}
            />
        </div>
    );
}

export default ArchiveParticipantsList;
