import { useEffect, useState } from "react";
import AddParticipant from "../../components/participants/forms/AddParticipant";
import ParticipantList from "../../components/participants/lists/ParticipantList";
import ArchiveParticipantsList from "../../components/archive/ArchiveParticipantsList";
import EditParticipant from "../../components/participants/forms/EditParticipant";
import { buildStaffPage, staffNavigateBack } from "../../utils/staffManegmentUtils/staffNavigation";

function ManageParticipants({ participantView, onNavigate }) {
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [listRefreshKey, setListRefreshKey] = useState(0);
    const [success, setSuccess] = useState("");
    const participantPage = participantView || "list";

    function refreshParticipantList() {
        setListRefreshKey((previous) => previous + 1);
    }

    function navigateToView(view) {
        onNavigate(buildStaffPage("manageParticipants", view));
    }

    function goBackToList() {
        setSelectedParticipant(null);

        if (participantPage === "list") {
            return;
        }

        staffNavigateBack();
    }

    function handleAddParticipantClick() {
        setSelectedParticipant(null);
        navigateToView("add");
    }

    function handleViewArchive() {
        setSelectedParticipant(null);
        setSuccess("");
        navigateToView("archive");
    }

    function handleEditParticipant(participant) {
        setSelectedParticipant(participant);
        navigateToView("edit");
    }

    useEffect(() => {
        if (participantPage !== "edit") {
            setSelectedParticipant(null);
        }
    }, [participantPage]);

    function handleParticipantSaved() {
        refreshParticipantList();
        goBackToList();
    }

    return (
        <div className="staff-page staff-page--participants">
            <div className="staff-container staff-container--participants">
                {success && (participantPage === "list" || participantPage === "archive") ? (
                    <p className="staff-alert staff-alert--success">{success}</p>
                ) : null}

                {participantPage === "list" && (
                    <section className="staff-section staff-section--list staff-section--participants-list">
                        <ParticipantList
                            refreshKey={listRefreshKey}
                            onEditParticipant={handleEditParticipant}
                            onAddParticipant={handleAddParticipantClick}
                            onViewArchive={handleViewArchive}
                        />
                    </section>
                )}

                {participantPage === "archive" && (
                    <section className="staff-section staff-section--list staff-section--participants-archive">
                        <ArchiveParticipantsList
                            refreshKey={listRefreshKey}
                            onActionMessage={(message) => {
                                setSuccess(message);
                                refreshParticipantList();
                            }}
                        />
                    </section>
                )}

                {participantPage === "add" && (
                    <section className="staff-section staff-section--form">
                        <div className="staff-toolbar">
                            <button
                                type="button"
                                className="staff-button staff-button--secondary staff-button--small"
                                onClick={goBackToList}
                            >
                                חזרה לרשימת משתתפים
                            </button>
                        </div>

                        <AddParticipant
                            onSuccess={handleParticipantSaved}
                            onCancel={goBackToList}
                        />
                    </section>
                )}

                {participantPage === "edit" && selectedParticipant && (
                    <section className="staff-section staff-section--form">
                        <div className="staff-toolbar">
                            <button
                                type="button"
                                className="staff-button staff-button--secondary staff-button--small"
                                onClick={goBackToList}
                            >
                                חזרה לרשימת משתתפים
                            </button>
                        </div>

                        <EditParticipant
                            key={selectedParticipant.id}
                            participant={selectedParticipant}
                            onCompleted={handleParticipantSaved}
                            onCancel={goBackToList}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}

export default ManageParticipants;
