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
import ProgramForm from "../../components/programs/ProgramForm";
import ProgramList from "../../components/programs/ProgramList";

function ManagePrograms({ programView, onNavigate }) {
    const [editingProgram, setEditingProgram] = useState(null);
    const [listRefreshKey, setListRefreshKey] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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

        const confirmed = window.confirm("האם למחוק תוכנית זו?");
        if (!confirmed) {
            return;
        }

        try {
            await deleteProgram(programId);

            if (editingProgram?.id === programId) {
                setEditingProgram(null);
                goBackToList();
            }

            refreshProgramList();
            setSuccess("התוכנית נמחקה בהצלחה");
            setError("");
        } catch (err) {
            console.error(err);
            setError("שגיאה במחיקת התוכנית");
        }
    }

    return (
        <div className="staff-page staff-page--programs programs-mgmt-page" dir="rtl">
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="programs-mgmt-decoration programs-mgmt-decoration--top"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="programs-mgmt-decoration programs-mgmt-decoration--left"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="programs-mgmt-decoration programs-mgmt-decoration--bottom"
            />
            <div className="staff-container staff-container--programs">
                {error && programPage === "list" ? (
                    <p className="staff-alert staff-alert--error">{error}</p>
                ) : null}
                {success && programPage === "list" ? (
                    <p className="staff-alert staff-alert--success">{success}</p>
                ) : null}

                {programPage === "list" && (
                    <section className="staff-section staff-section--list staff-section--programs-list">
                        <ProgramList
                            refreshKey={listRefreshKey}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAddProgram={handleAddProgramClick}
                            onBack={() => onNavigate("dashboard")}
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
        </div>
    );
}

export default ManagePrograms;
