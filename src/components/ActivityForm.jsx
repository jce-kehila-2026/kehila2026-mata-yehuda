import { useState, useEffect, useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import { formatDate, formatTime, getDayOfWeekFromActivityDate, parseLocalDateInput } from "../utils/dateUtils";
import {
    getRegistrationAvailabilityLabel,
    isRegistrationOpenForDeadlineInput,
    REGISTRATION_AVAILABILITY_LABELS
} from "../utils/activityStatus";
import FormActionRow from "./shared/FormActionRow";

function ActivityForm({
    activityTypes,
    onSubmit,
    editingActivity,
    onCancelEdit
}) {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [startDate, setStartDate] = useState("");
    const [registrationDeadLine, setRegistrationDeadLine] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [price, setPrice] = useState(0);
    const [priceNote, setPriceNote] = useState("");

    useEffect(() => {
        if (editingActivity) {
            setName(editingActivity.data.name || "");
            setDescription(editingActivity.data.description || "");
            setImageURL(editingActivity.data.image_url || "");

            setStartDate(formatDate(editingActivity.data.start_date));
            setRegistrationDeadLine(formatDate(editingActivity.data.registration_deadline));
            setStartTime(formatTime(editingActivity.data.start_date));
            setEndTime(formatTime(editingActivity.data.end_date));

            setMaxParticipants(editingActivity.data.max_participants || 0);
            setPrice(editingActivity.data.price || 0);
            setPriceNote(editingActivity.data.price_note || "");
        }
        else {
            setName("");
            setDescription("");
            setImageURL("");
            setStartDate("");
            setRegistrationDeadLine("");
            setStartTime("");
            setEndTime("");
            setMaxParticipants(0);
            setPrice(0);
            setPriceNote("");
        }
    }, [editingActivity]);

    const registrationStatusLabel = useMemo(() => {
        if (registrationDeadLine) {
            return getRegistrationAvailabilityLabel({
                registration_deadline: parseLocalDateInput(registrationDeadLine)
            });
        }

        if (editingActivity?.data) {
            return getRegistrationAvailabilityLabel(editingActivity.data);
        }

        return REGISTRATION_AVAILABILITY_LABELS.unknown;
    }, [registrationDeadLine, editingActivity]);


    function handleCancel() {
        setName("");
        setDescription("");
        setImageURL("");
        setStartDate("");
        setRegistrationDeadLine("");
        setStartTime("");
        setEndTime("");
        setMaxParticipants(0);
        setPrice(0);
        setPriceNote("");

        onCancelEdit();
    }

    async function handleSubmit() {
        if (!name || !startDate || !startTime || !endTime || !registrationDeadLine) {
            alert("נא למלא שם פעילות, תאריך, שעות ותאריך אחרון להרשמה");
            return;
        }
        const activityData = {
            name,
            description,
            image_url: imageURL,

            start_date: Timestamp.fromDate(new Date(`${startDate}T${startTime}`)),
            end_date: Timestamp.fromDate(new Date(`${startDate}T${endTime}`)),
            registration_deadline: Timestamp.fromDate(new Date(`${registrationDeadLine}T23:59`)),

            day_of_week: getDayOfWeekFromActivityDate(startDate, startTime),
            max_participants: Number(maxParticipants),
            current_participants: editingActivity
                ? editingActivity.data.current_participants || 0
                : 0,
            price: Number(price),
            price_note: priceNote,
            is_open: isRegistrationOpenForDeadlineInput(registrationDeadLine),
            created_at: editingActivity ? editingActivity.data.created_at : Timestamp.now()
        };
        await onSubmit(activityData);
        setName("");
        setDescription("");
        setImageURL("");
        setStartDate("");
        setRegistrationDeadLine("");
        setStartTime("");
        setEndTime("");
        setMaxParticipants(0);
        setPrice(0);
        setPriceNote("");
    }


    return (
        <div>
            <div className="staff-form">
                <label>שם הפעולה</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="staff-form">
                <label>תיאור</label>
                <textarea
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="staff-form">
                <label>קישור לתמונה</label>
                <input
                    type="text"
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
                />
            </div>
            <div className="staff-form">
                <label>תאריך הפעולה</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div className="staff-form">
                <label>מספר משתתפים מקסימלי</label>
                <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                />
            </div>
            <div className="staff-form">
                <label>תאריך אחרון להרשמה</label>
                <input
                    type="date"
                    value={registrationDeadLine}
                    onChange={(e) => setRegistrationDeadLine(e.target.value)}
                />
                <p className="activity-form-registration-status">
                    סטטוס הרשמה: {registrationStatusLabel}
                </p>
            </div>
            <div className="staff-form">
                <label>שעת התחלה</label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
            </div>
            <div className="staff-form">
                <label>שעת סיום</label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>
            <div className="staff-form">
                <label>מחיר</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>
            <div className="staff-form">
                <label>הערת מחיר</label>
                <input
                    type="text"
                    value={priceNote}
                    onChange={(e) => setPriceNote(e.target.value)}
                />
            </div>
            <FormActionRow
                submitLabel={editingActivity ? "עדכון פעילות" : "הוספת פעילות"}
                onSubmit={handleSubmit}
                onCancel={editingActivity ? handleCancel : undefined}
            />
        </div>
    );

}
export default ActivityForm;