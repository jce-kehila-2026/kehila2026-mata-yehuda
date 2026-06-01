import { useState } from "react";
import AddParticipant from "../components/participants/AddParticipant";
import ParticipantList from "../components/participants/ParticipantList";
import EditParticipant from "../components/participants/EditParticipant";

function ManageParticipants() {
    const [participantPage, setParticipantPage] = useState("menu");
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    return (
        <div>
            <h1>ניהול משתתפים</h1>

            {participantPage === "menu" && (
                <div className="dashboard-buttons">
                    <button onClick={() => setParticipantPage("add")}>
                        הוספת משתתף
                    </button>

                    <button onClick={() => setParticipantPage("list")}>
                        רשימת משתתפים
                    </button>
                </div>
            )}

            {participantPage !== "menu" && (
                <button onClick={() => setParticipantPage("menu")}>
                    חזרה לניהול משתתפים
                </button>
            )}

            {participantPage === "add" && <AddParticipant />}

            {participantPage === "edit" && (
                <EditParticipant participant={selectedParticipant} />
            )}

            {participantPage === "list" && (
                <ParticipantList
                    onEditParticipant={(participant) => {
                        setSelectedParticipant(participant);
                        setParticipantPage("edit");
                    }}
                />
            )}
        </div>
    );
}

export default ManageParticipants;
