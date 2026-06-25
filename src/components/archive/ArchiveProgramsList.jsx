import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive } from "lucide-react";
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
    fetchArchivedProgramsForAdminList,
    filterProgramsList,
    getProgramSortValue,
    permanentlyDeleteProgram,
    restoreProgram
} from "../../services/staffManegmentServices/programService";
import { formatProgramTitle } from "../../utils/staffManegmentUtils/programConstants";
import { PERMANENT_DELETE_CONFIRM_MESSAGE } from "../../utils/staffManegmentUtils/archiveUtils";
import { formatDate } from "../../utils/staffManegmentUtils/dateUtils";
import { hasValue } from "../../utils/staffManegmentUtils/hasValue";

const ARCHIVE_PROGRAM_COLUMNS = [
    { key: "title", label: "שם התוכנית", sortKey: "title" },
    { key: "description", label: "תיאור", sortKey: "description" },
    { key: "archivedAt", label: "תאריך העברה לארכיון" },
    { key: "actions", label: "פעולות" }
];

function ArchiveProgramsList({ refreshKey = 0, onActionMessage }) {
    const [sourceItems, setSourceItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const confirm = useStaffConfirmAction();

    const filterItems = useCallback(
        (items, searchQuery) => filterProgramsList(items, searchQuery),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount: sourceItems.length,
        getSortValue: getProgramSortValue,
        initialSortField: "title"
    });

    async function loadArchivedPrograms() {
        setLoading(true);
        setLoadError("");

        try {
            const records = await fetchArchivedProgramsForAdminList();
            setSourceItems(records);
        } catch (error) {
            console.error(error);
            setLoadError("שגיאה בטעינת תוכניות מהארכיון");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadArchivedPrograms();
    }, [refreshKey]);

    function handleRestore(programId) {
        confirm.requestAction({
            message: "האם לשחזר את התוכנית מהארכיון?",
            confirmLabel: "שחזור",
            action: async () => {
                await restoreProgram(programId);
                onActionMessage?.("התוכנית שוחזרה בהצלחה");
                await loadArchivedPrograms();
            }
        });
    }

    function handlePermanentDelete(programId) {
        confirm.requestAction({
            message: PERMANENT_DELETE_CONFIRM_MESSAGE,
            confirmLabel: "מחיקה סופית",
            action: async () => {
                await permanentlyDeleteProgram(programId);
                onActionMessage?.("התוכנית נמחקה לצמיתות");
                await loadArchivedPrograms();
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
                    title="אין תוכניות בארכיון"
                    message="תוכניות שהועברו לארכיון יופיעו כאן."
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={Archive}
                    title="אין פריטים בארכיון"
                    message="נסו לשנות את החיפוש כדי למצוא תוכניות אחרות בארכיון."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered]);

    function renderActions(program) {
        return (
            <AdminTableActions>
                <AdminTableRestoreButton
                    onClick={() => handleRestore(program.id)}
                    label="שחזור תוכנית"
                />
                <AdminTableDeleteButton
                    onClick={() => handlePermanentDelete(program.id)}
                    label="מחיקה סופית"
                />
            </AdminTableActions>
        );
    }

    return (
        <div className="staff-list-section admin-list-section admin-list-section--archive-programs">
            <div className="admin-list-header">
                <h2 className="admin-list-header__title">ארכיון תוכניות</h2>
            </div>

            <AdminListToolbar
                searchId="archive-program-search"
                searchLabel="חיפוש"
                searchPlaceholder="חיפוש לפי שם תוכנית"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="מספר תוכניות בעמוד"
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
                                ariaLabel="טבלת תוכניות בארכיון"
                                compact
                                columns={ARCHIVE_PROGRAM_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((program) => (
                                    <tr key={program.id}>
                                        <td>{formatProgramTitle(program) || "—"}</td>
                                        <td>{program.description || "—"}</td>
                                        <td>{formatDate(program.archivedAt) || "—"}</td>
                                        <td>{renderActions(program)}</td>
                                    </tr>
                                ))}
                            />
                        }
                        mobileCards={
                            <div className="programs-list staff-grid staff-grid--cards">
                                {list.pageItems.map((program) => (
                                    <article
                                        key={program.id}
                                        className="program-card archive-card"
                                    >
                                        <div className="program-card__body">
                                            {hasValue(formatProgramTitle(program)) && (
                                                <h3 className="program-card__title">
                                                    {formatProgramTitle(program)}
                                                </h3>
                                            )}
                                            {hasValue(program.description) && (
                                                <p className="program-card__description">
                                                    {program.description}
                                                </p>
                                            )}
                                            <p>
                                                תאריך העברה לארכיון:{" "}
                                                {formatDate(program.archivedAt) || "—"}
                                            </p>
                                        </div>
                                        <div className="program-card__actions archive-card__actions">
                                            {renderActions(program)}
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

export default ArchiveProgramsList;
