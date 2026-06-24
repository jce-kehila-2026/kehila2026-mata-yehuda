import { useEffect, useState } from "react";
import { buildStaffPage, staffNavigateBack } from "../../utils/staffManegmentUtils/staffNavigation";
import {
    addProgram,
    updateProgram,
    deleteProgram
} from "../../services/staffManegmentServices/programService";
import {
    getProgramsPageTitle,
    getProgramUpdateSuccessMessage,
    isFixedProgramId
} from "../../utils/staffManegmentUtils/programConstants";
import { ARCHIVE_CONFIRM_MESSAGE } from "../../utils/staffManegmentUtils/archiveUtils";
import StaffConfirmModal from "../../components/staff/StaffConfirmModal";
import ProgramForm from "../../components/programs/ProgramForm";
import ProgramList from "../../components/programs/ProgramList";
import ArchiveProgramsList from "../../components/archive/ArchiveProgramsList";

function ManagePrograms({ programView, onNavigate }) {
    const [editingProgram, setEditingProgram] = useState(null);
    const [listRefreshKey, setListRefreshKey] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pendingArchiveId, setPendingArchiveId] = useState(null);
    const [archiving, setArchiving] = useState(false);
    const programPage = programView || "list";

    function refreshProgramList() {
        setListRefreshKey((previous) => previous + 1);
    }

    function navigateToView(view) {
        onNavigate(buildStaffPage("programs", view));
    }

    function goBackToList() {
        setEditingProgram(null);
        if (programPage === "list") {
            return;
        }

        staffNavigateBack();
    }

    function handleAddProgramClick() {
        setEditingProgram(null);
        setError("");
        setSuccess("");
        navigateToView("add");
    }

    function handleViewArchive() {
        setEditingProgram(null);
        setError("");
        setSuccess("");
        navigateToView("archive");
    }

    function handleEdit(program) {
        setEditingProgram(program);
        setError("");
        setSuccess("");
        navigateToView("edit");
    }

    function handleCancelEdit() {
        setError("");
        setSuccess("");
        goBackToList();
    }

    useEffect(() => {
        if (programPage !== "edit") {
            setEditingProgram(null);
        }
    }, [programPage]);

    async function handleSaveProgram(programData) {
        try {
            if (editingProgram) {
                await updateProgram(editingProgram.id, programData);
                setSuccess(getProgramUpdateSuccessMessage(editingProgram.id));
            } else {
                await addProgram(programData);
                setSuccess("התוכנית נוספה בהצלחה");
            }

            refreshProgramList();
            setError("");
            goBackToList();
        } catch (err) {
            console.error(err);
            setError(
                editingProgram ? "שגיאה בעדכון התוכנית" : "שגיאה בהוספת התוכנית"
            );
            setSuccess("");
            throw err;
        }
    }

    async function handleDelete(programId) {
        if (isFixedProgramId(programId)) {
            setError("לא ניתן למחוק תוכנית מערכת");
            setSuccess("");
            return;
        }

        setPendingArchiveId(programId);
    }

    async function confirmArchiveProgram() {
        if (!pendingArchiveId) {
            return;
        }

        setArchiving(true);

        try {
            await deleteProgram(pendingArchiveId);

            if (editingProgram?.id === pendingArchiveId) {
                setEditingProgram(null);
                goBackToList();
            }

            refreshProgramList();
            setSuccess("התוכנית הועברה לארכיון בהצלחה");
            setError("");
        } catch (err) {
            console.error(err);
            setError("שגיאה בהעברת התוכנית לארכיון");
        } finally {
            setArchiving(false);
            setPendingArchiveId(null);
        }
    }

    return (
        <div className="staff-page staff-page--programs">
            <div className="staff-container staff-container--programs">
                {error && (programPage === "list" || programPage === "archive") ? (
                    <p className="staff-alert staff-alert--error">{error}</p>
                ) : null}
                {success && (programPage === "list" || programPage === "archive") ? (
                    <p className="staff-alert staff-alert--success">{success}</p>
                ) : null}

                {programPage === "list" && (
                    <section className="staff-section staff-section--list staff-section--programs-list">
                        <ProgramList
                            refreshKey={listRefreshKey}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAddProgram={handleAddProgramClick}
                            onViewArchive={handleViewArchive}
                        />
                    </section>
                )}

                {programPage === "archive" && (
                    <section className="staff-section staff-section--list staff-section--programs-archive">
                        <ArchiveProgramsList
                            refreshKey={listRefreshKey}
                            onActionMessage={(message) => {
                                setSuccess(message);
                                setError("");
                                refreshProgramList();
                            }}
                        />
                    </section>
                )}

                {(programPage === "add" || programPage === "edit") && (
                    <section className="staff-section staff-section--form">
                        <div className="staff-toolbar">
                            <button
                                type="button"
                                className="staff-button staff-button--secondary staff-button--small"
                                onClick={goBackToList}
                            >
                                חזרה לרשימת תוכניות
                            </button>
                        </div>

                        <h2>
                            {programPage === "edit"
                                ? getProgramsPageTitle(editingProgram?.id)
                                : "הוספת תוכנית חדשה"}
                        </h2>

                        <ProgramForm
                            editingProgram={
                                programPage === "edit" ? editingProgram : null
                            }
                            onSubmit={handleSaveProgram}
                            onCancelEdit={handleCancelEdit}
                            formError={error}
                            formSuccess={success}
                        />
                    </section>
                )}
            </div>

            <StaffConfirmModal
                message={pendingArchiveId ? ARCHIVE_CONFIRM_MESSAGE : ""}
                confirmLabel="העברה לארכיון"
                confirming={archiving}
                onConfirm={confirmArchiveProgram}
                onCancel={() => {
                    if (!archiving) {
                        setPendingArchiveId(null);
                    }
                }}
            />
        </div>
    );
}

export default ManagePrograms;
