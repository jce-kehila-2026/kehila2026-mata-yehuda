import { useEffect, useMemo, useState } from "react";
import {
    fetchParticipantsWithRegistrations,
    deleteParticipant
} from "../../../services/participantService";
import { formatDate } from "../../../utils/dateUtils";
import { hasFormattedDisplay, hasValue } from "../../../utils/hasValue";

const GENDER_LABELS = {
    male: "זכר",
    female: "נקבה",
    other: "אחר"
};

function filterParticipantList(participantList, searchQuery) {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
        return participantList;
    }

    return participantList.filter((participant) => {
        const firstName = (participant.first_name || "").toLowerCase();
        const lastName = (participant.last_name || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const idNumber = (participant.id_number || "").toLowerCase();
        const phone = (participant.phone || "").toLowerCase();

        return (
            fullName.includes(query) ||
            firstName.includes(query) ||
            lastName.includes(query) ||
            idNumber.includes(query) ||
            phone.includes(query)
        );
    });
}

function ParticipantList({ onEditParticipant }) {
    const [participantList, setParticipantList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const filteredParticipants = useMemo(
        () => filterParticipantList(participantList, searchQuery),
        [participantList, searchQuery]
    );

    async function loadParticipants() {
        setLoading(true);
        setError("");
        try {
            const data = await fetchParticipantsWithRegistrations();
            setParticipantList(data);
        } catch (err) {
            console.log(err);
            setError("שגיאה בטעינת המשתתפים");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadParticipants();
    }, []);

    async function handleDeleteParticipant(participant) {
        const confirmDelete = window.confirm(
            "האם אתה בטוח שברצונך למחוק משתתף זה?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteParticipant(participant.id);
            setParticipantList((prev) =>
                prev.filter((item) => item.id !== participant.id)
            );
            alert("המשתתף נמחק בהצלחה");
        } catch (err) {
            console.log(err);
            alert("שגיאה במחיקת המשתתף");
        }
    }

    return (
        <div className="participants-list-section">
            <h2>רשימת משתתפים</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="staff-form staff-list-filters">
                <label htmlFor="participant-search">חיפוש</label>
                <input
                    id="participant-search"
                    type="text"
                    placeholder="שם, תעודת זהות או טלפון"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <p className="staff-list-count">
                    נמצאו {filteredParticipants.length} מתוך {participantList.length}
                </p>
            </div>

            {loading && <p>טוען...</p>}

            {!loading && participantList.length === 0 && (
                <p>אין משתתפים במערכת</p>
            )}

            {!loading && participantList.length > 0 && filteredParticipants.length === 0 && (
                <p>לא נמצאו תוצאות לחיפוש</p>
            )}

            <div className="participants-list staff-grid staff-grid--cards">
                {filteredParticipants.map((participant) => {
                    const fullName = [participant.first_name, participant.last_name]
                        .filter(hasValue)
                        .join(" ");
                    const birthDateLabel = formatDate(participant.birth_date);
                    const genderLabel =
                        GENDER_LABELS[participant.gender] || participant.gender;

                    return (
                    <div key={participant.id} className="staff-card">
                        <div className="staff-card-body">
                            {hasValue(fullName) && <p>שם: {fullName}</p>}
                            {hasValue(participant.id_number) && (
                                <p>תעודת זהות: {participant.id_number}</p>
                            )}
                            {hasValue(participant.phone) && (
                                <p>טלפון: {participant.phone}</p>
                            )}
                            {hasFormattedDisplay(birthDateLabel) && (
                                <p>תאריך לידה: {birthDateLabel}</p>
                            )}
                            {hasValue(genderLabel) && (
                                <p>מגדר: {genderLabel}</p>
                            )}
                            {hasValue(participant.address) && (
                                <p>כתובת: {participant.address}</p>
                            )}
                            {hasValue(participant.emergency_number) && (
                                <p>מספר חירום: {participant.emergency_number}</p>
                            )}
                            {hasValue(participant.registration_status) && (
                                <p>סטטוס הרשמה: {participant.registration_status}</p>
                            )}
                        </div>

                        <div className="staff-card-actions">
                            <button
                                type="button"
                                className="staff-button staff-button--small staff-button--secondary"
                                onClick={() => onEditParticipant(participant)}
                            >
                                עריכה
                            </button>
                            <button
                                type="button"
                                className="staff-button staff-button--small staff-button--danger"
                                onClick={() => handleDeleteParticipant(participant)}
                            >
                                מחיקה
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ParticipantList;
