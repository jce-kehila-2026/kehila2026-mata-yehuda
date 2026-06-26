import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, ClipboardList, Plus } from "lucide-react";
import ProgramCard from "./ProgramCard";
import AdminDataTable from "../admin/AdminDataTable";
import AdminListEmptyState from "../admin/AdminListEmptyState";
import AdminListToolbar from "../admin/AdminListToolbar";
import AdminResponsiveList from "../admin/AdminResponsiveList";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton
} from "../admin/AdminTableActions";
import { useAdminList } from "../../hooks/useAdminList";
import {
    countProgramsRecords,
    fetchProgramsForAdminList,
    filterProgramsList,
    getProgramSortValue
} from "../../services/staffManegmentServices/programService";
import {
    formatProgramTitle,
    isFixedProgram
} from "../../utils/staffManegmentUtils/programConstants";

const PROGRAM_COLUMNS = [
    { key: "image", label: "תמונה" },
    { key: "title", label: "כותרת", sortKey: "title" },
    { key: "description", label: "תיאור", sortKey: "description" },
    { key: "actions", label: "פעולות" }
];

const SYSTEM_PROGRAM_DELETE_NOTE = "תוכנית מערכת - לא ניתן למחוק";

function truncateDescription(text, maxLength = 90) {
    const normalized = text?.trim();

    if (!normalized) {
        return "—";
    }

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength)}…`;
}

function ProgramList({
    refreshKey = 0,
    onEdit,
    onDelete,
    onAddProgram,
    onViewArchive,
    onBack
}) {
    const [sourceItems, setSourceItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const filterItems = useCallback(
        (items, searchQuery) => filterProgramsList(items, searchQuery),
        []
    );

    const list = useAdminList({
        sourceItems,
        filterItems,
        totalCount,
        getSortValue: getProgramSortValue,
        initialSortField: "title"
    });

    async function loadPrograms() {
        setLoading(true);
        setLoadError("");

        try {
            const [records, count] = await Promise.all([
                fetchProgramsForAdminList(),
                countProgramsRecords()
            ]);

            setSourceItems(records);
            setTotalCount(count);
        } catch (error) {
            console.error(error);
            setLoadError("שגיאה בטעינת התוכניות");
            setSourceItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPrograms();
    }, [refreshKey]);

    const emptyState = useMemo(() => {
        if (loading) {
            return null;
        }

        if (sourceItems.length === 0) {
            return (
                <AdminListEmptyState
                    icon={ClipboardList}
                    title="אין תוכניות במערכת"
                    message="התחילו ביצירת התוכנית הראשונה כדי לנהל תוכניות ותיאורים."
                    actionLabel={onAddProgram ? "הוספת תוכנית" : undefined}
                    onAction={onAddProgram}
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={ClipboardList}
                    title="לא נמצאו תוצאות"
                    message="נסו לשנות את החיפוש כדי למצוא תוכניות אחרות."
                />
            );
        }

        return null;
    }, [loading, sourceItems.length, list.totalFiltered, onAddProgram]);

    function renderProgramActions(program) {
        const fixedProgram = isFixedProgram(program);

        return (
            <AdminTableActions>
                {onEdit ? (
                    <AdminTableEditButton onClick={() => onEdit(program)} />
                ) : null}
                {fixedProgram ? (
                    <span
                        className="program-list__system-note"
                        title={SYSTEM_PROGRAM_DELETE_NOTE}
                    >
                        {SYSTEM_PROGRAM_DELETE_NOTE}
                    </span>
                ) : (
                    <AdminTableDeleteButton
                        onClick={() => onDelete(program.id)}
                    />
                )}
            </AdminTableActions>
        );
    }

    return (
        <div className="staff-list-section admin-list-section admin-list-section--programs">
            <header className="programs-mgmt-page__header">
                <div className="programs-mgmt-page__header-main">
                    <h2 className="programs-mgmt-page__title">ניהול תוכניות</h2>
                    <p className="programs-mgmt-page__subtitle">
                        ניהול, צפייה וחיפוש של כל התוכניות במערכת
                    </p>
                </div>
                <div className="programs-mgmt-page__actions">
                    {onAddProgram ? (
                        <button
                            type="button"
                            className="programs-mgmt-page__action"
                            onClick={onAddProgram}
                        >
                            <Plus
                                className="programs-mgmt-page__action-icon"
                                strokeWidth={2.25}
                                aria-hidden="true"
                            />
                            <span>הוספת תוכנית</span>
                        </button>
                    ) : null}
                    {onViewArchive ? (
                        <button
                            type="button"
                            className="programs-mgmt-page__action programs-mgmt-page__action--archive"
                            onClick={onViewArchive}
                        >
                            <Archive
                                className="programs-mgmt-page__action-icon"
                                strokeWidth={2.25}
                                aria-hidden="true"
                            />
                            <span>צפייה בארכיון</span>
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

            <AdminListToolbar
                searchId="program-search"
                searchLabel="חיפוש"
                searchPlaceholder="חיפוש לפי כותרת תוכנית"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="מספר תוכניות בעמוד"
            />

            {loadError ? (
                <p className="staff-alert staff-alert--error">{loadError}</p>
            ) : null}

            {loading ? <p className="programs-mgmt-loading">טוען...</p> : null}

            {!loading && list.totalFiltered === 0 ? (
                <div className="programs-mgmt-list">{emptyState}</div>
            ) : null}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <div className="programs-mgmt-list">
                    <AdminResponsiveList
                        desktopTable={
                            <AdminDataTable
                                ariaLabel="טבלת תוכניות"
                                compact
                                columns={PROGRAM_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((program) => {
                                    const displayTitle = formatProgramTitle(program);
                                    const imageUrl = program.image_url?.trim();

                                    return (
                                        <tr key={program.id}>
                                            <td>
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt=""
                                                        className="program-list__thumbnail"
                                                    />
                                                ) : (
                                                    <span className="program-list__thumbnail-placeholder">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td>{displayTitle || "—"}</td>
                                            <td>
                                                {truncateDescription(
                                                    program.description
                                                )}
                                            </td>
                                            <td>{renderProgramActions(program)}</td>
                                        </tr>
                                    );
                                })}
                            />
                        }
                        mobileCards={
                            <div className="programs-list staff-grid staff-grid--cards">
                                {list.pageItems.map((program) => (
                                    <ProgramCard
                                        key={program.id}
                                        program={program}
                                        isFixedProgram={isFixedProgram(program)}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        systemDeleteNote={SYSTEM_PROGRAM_DELETE_NOTE}
                                    />
                                ))}
                            </div>
                        }
                    />
                    </div>

                    <div className="programs-mgmt-pagination">
                        <button
                            type="button"
                            className="programs-mgmt-pagination__btn"
                            onClick={() => list.setPage(list.page - 1)}
                            disabled={list.page <= 1}
                        >
                            הקודם
                        </button>
                        <span className="programs-mgmt-pagination__label">
                            עמוד {list.page} מתוך {list.totalPages}
                        </span>
                        <button
                            type="button"
                            className="programs-mgmt-pagination__btn"
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

export default ProgramList;
