import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";

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
    const [dayOfWeek, setDayOfWeek] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [price, setPrice] = useState(0);
    const [priceNote, setPriceNote] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    function formatDate(value) {
        if (!value) return "";

        if (value.toDate) {
            return value.toDate().toISOString().split("T")[0];
        }

        if (value.seconds) {
            return new Date(value.seconds * 1000).toISOString().split("T")[0];
        }

        return value;
    }

    function formatTime(value) {
        if (!value) return "";

        let date;

        if (value.toDate) {
            date = value.toDate();
        } else if (value.seconds) {
            date = new Date(value.seconds * 1000);
        } else {
            return value;
        }

        return date.toTimeString().slice(0, 5);
    }

    useEffect(() => {
        if (editingActivity) {
            setName(editingActivity.data.name || "");
            setDescription(editingActivity.data.description || "");
            setImageURL(editingActivity.data.image_url || "");

            setStartDate(formatDate(editingActivity.data.start_date));
            setRegistrationDeadLine(formatDate(editingActivity.data.registration_deadline));
            setStartTime(formatTime(editingActivity.data.start_date));
            setEndTime(formatTime(editingActivity.data.end_date));

            setDayOfWeek(editingActivity.data.day_of_week || "");
            setMaxParticipants(editingActivity.data.max_participants || 0);
            setPrice(editingActivity.data.price || 0);
            setPriceNote(editingActivity.data.price_note || "");
            setIsOpen(editingActivity.data.is_open || false);
        }
        else {
            setName("");
            setDescription("");
            setImageURL("");
            setStartDate("");
            setRegistrationDeadLine("");
            setStartTime("");
            setEndTime("");
            setDayOfWeek("");
            setMaxParticipants(0);
            setPrice(0);
            setPriceNote("");
            setIsOpen(false);
        }
    }, [editingActivity]);


    function handleCancel() {
        setName("");
        setDescription("");
        setImageURL("");
        setStartDate("");
        setRegistrationDeadLine("");
        setStartTime("");
        setEndTime("");
        setDayOfWeek("");
        setMaxParticipants(0);
        setPrice(0);
        setPriceNote("");
        setIsOpen(false);

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

            day_of_week: dayOfWeek,
            max_participants: Number(maxParticipants),
            current_participants: editingActivity
                ? editingActivity.data.current_participants || 0
                : 0,
            price: Number(price),
            price_note: priceNote,
            is_open: isOpen,
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
        setDayOfWeek("");
        setMaxParticipants(0);
        setPrice(0);
        setPriceNote("");
        setIsOpen(false);
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
                <label>יום בשבוע</label>
                <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                >
                    <option value="">בחר יום</option>
                    <option value="sunday">יום ראשון</option>
                    <option value="monday">יום שני</option>
                    <option value="tuesday">יום שלישי</option>
                    <option value="wednesday">יום רביעי</option>
                    <option value="thursday">יום חמישי</option>
                    <option value="friday">יום שישי</option>
                    <option value="saturday">יום שבת</option>
                </select>
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
            <div className="row checkbox-row">
                <label>פתוח להרשמה</label>
                <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                />
            </div>
            <button type="button" onClick={handleSubmit}>
                {editingActivity ? "עדכון פעילות" : "הוספת פעילות"}
            </button>

            {editingActivity && (
                <button type="button" onClick={handleCancel}>
                    ביטול עריכה
                </button>
            )}
        </div>
    );

}
export default ActivityForm;