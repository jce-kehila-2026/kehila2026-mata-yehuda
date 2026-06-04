import { useState, useEffect } from "react";
import AddParticipant from "../components/participants/forms/AddParticipant";
import ParticipantList from "../components/participants/lists/ParticipantList";
import EditParticipant from "../components/participants/forms/EditParticipant";
import { buildStaffPage, staffNavigateBack } from "../utils/staffNavigation";

function ManageParticipants({ participantView, onNavigate }) {
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const participantPage = participantView || "menu";

    function navigateToView(view) {
        onNavigate(buildStaffPage("manageParticipants", view));
    }

    function goBack() {
        staffNavigateBack();
    }

    useEffect(() => {
        if (participantPage !== "edit") {
            setSelectedParticipant(null);
        }
    }, [participantPage]);

    return (
        <div className="staff-page staff-page--participants">
            <header className="staff-header">
                <h1>ניהול משתתפים</h1>
            </header>

            <div className="staff-container">
                {participantPage === "menu" && (
                    <div className="staff-actions staff-actions--inline">
                        <button
                            type="button"
                            className="staff-button"
                            onClick={() => navigateToView("add")}
                        >
                            הוספת משתתף
                        </button>

                        <button
                            type="button"
                            className="staff-button"
                            onClick={() => navigateToView("list")}
                        >
                            רשימת משתתפים
                        </button>
                    </div>
                )}

                {participantPage !== "menu" && (
                    <div className="staff-toolbar">
                        <button
                            type="button"
                            className="staff-button staff-button--secondary staff-button--small"
                            onClick={goBack}
                        >
                            חזרה לניהול משתתפים
                        </button>
                    </div>
                )}

                {participantPage === "add" && (
                    <section className="staff-section">
                        <AddParticipant />
                    </section>
                )}

                {participantPage === "edit" && selectedParticipant && (
                    <section className="staff-section">
                        <EditParticipant
                            key={selectedParticipant.id}
                            participant={selectedParticipant}
                        />
                    </section>
                )}

                {participantPage === "list" && (
                    <section className="staff-section staff-section--list">
                        <ParticipantList
                            onEditParticipant={(participant) => {
                                setSelectedParticipant(participant);
                                navigateToView("edit");
                            }}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}

export default ManageParticipants;
