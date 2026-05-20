import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

function ManageActivities() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [activityTypeId, setActivityTypeId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [registrationDeadLine, setRegistrationDeadLine] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [price, setPrice] = useState(0);
    const [priceNote, setPriceNote] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [activities, setActivities] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [editingActivity, setEditingActivity] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function validateActivity() {
        if (!name.trim()) {
            setError("יש להזין שם פעילות");
            setSuccess("");
            return false;
        }

        if (!description.trim()) {
            setError("יש להזין תיאור");
            setSuccess("");
            return false;
        }

        if (!activityTypeId) {
            setError("יש לבחור סוג פעילות");
            setSuccess("");
            return false;
        }

        if (!startDate) {
            setError("יש להזין תאריך התחלה");
            setSuccess("");
            return false;
        }

        if (!endDate) {
            setError("יש להזין תאריך סיום");
            setSuccess("");
            return false;
        }

        if (Number(maxParticipants) <= 0) {
            setError("מספר המשתתפים חייב להיות גדול מ־0");
            setSuccess("");
            return false;
        }

        if (Number(price) < 0) {
            setError("המחיר לא יכול להיות שלילי");
            setSuccess("");
            return false;
        }

        setError("");
        return true;
    }

    async function fetchActivityTypes() {
        const docs = await getDocs(collection(db, "activityTypes"));
        const document = docs.docs.map(d => ({
            id: d.id,
            data: d.data()
        }));
        setActivityTypes(document);
    }

    async function fetchActivities() {
        const docs = await getDocs(collection(db, "activities"));
        const document = docs.docs.map(d => ({
            id: d.id,
            data: d.data()
        }));
        setActivities(document);
    }

    async function handleAddActivity() {
        if (!validateActivity()) {
            return;
        }
        const activityData = {
            name,
            description,
            image_url: imageURL,
            activity_type_id: activityTypeId,
            start_date: startDate,
            end_date: endDate,
            registration_deadline: registrationDeadLine,
            start_time: startTime,
            end_time: endTime,
            day_of_week: dayOfWeek,
            max_participants: Number(maxParticipants),
            price: Number(price),
            price_note: priceNote,
            is_open: isOpen
        }
        await addDoc(collection(db, "activities"), activityData);
        await fetchActivities();
        setSuccess("הפעילות נוספה בהצלחה");
        setError("");
        setName("");
        setDescription("");
        setImageURL("");
        setActivityTypeId("");
        setStartDate("");
        setEndDate("");
        setRegistrationDeadLine("");
        setStartTime("");
        setEndTime("");
        setDayOfWeek("");
        setMaxParticipants(0);
        setPrice(0);
        setPriceNote("");
        setIsOpen(false);
    }

    useEffect(() => {
        fetchActivities();
        fetchActivityTypes();
    }, []);

    async function handleDeleteActivity(activityId) {
        await deleteDoc(doc(db, "activities", activityId));
        await fetchActivities();
        setSuccess("הפעילות נמחקה בהצלחה");
        setError("");
    }

    function handleEditActivity(activity) {
        setEditingActivity(activity);
        setName(activity.data.name);
        setDescription(activity.data.description);
        setImageURL(activity.data.image_url);
        setActivityTypeId(activity.data.activity_type_id);
        setStartDate(activity.data.start_date);
        setEndDate(activity.data.end_date);
        setRegistrationDeadLine(activity.data.registration_deadline);
        setStartTime(activity.data.start_time);
        setEndTime(activity.data.end_time);
        setDayOfWeek(activity.data.day_of_week);
        setMaxParticipants(activity.data.max_participants);
        setPrice(activity.data.price);
        setPriceNote(activity.data.price_note);
        setIsOpen(activity.data.is_open);

    }

    function handleCancelEdit() {
        setEditingActivity(null);
        setName("");
        setDescription("");
        setImageURL("");
        setActivityTypeId("");
        setStartDate("");
        setEndDate("");
        setRegistrationDeadLine("");
        setStartTime("");
        setEndTime("");
        setDayOfWeek("");
        setMaxParticipants(0);
        setPrice(0);
        setPriceNote("");
        setIsOpen(false);
        setError("");
        setSuccess("");
    }

    async function handleUpdateActivity() {
        if (!validateActivity()) {
            return;
        }
        const activityData = {
            name,
            description,
            image_url: imageURL,
            activity_type_id: activityTypeId,
            start_date: startDate,
            end_date: endDate,
            registration_deadline: registrationDeadLine,
            start_time: startTime,
            end_time: endTime,
            day_of_week: dayOfWeek,
            max_participants: Number(maxParticipants),
            price: Number(price),
            price_note: priceNote,
            is_open: isOpen
        }
        await updateDoc(doc(db, "activities", editingActivity.id), activityData);
        await fetchActivities();
        setSuccess("הפעילות עודכנה בהצלחה");
        setError("");
        setName("");
        setDescription("");
        setImageURL("");
        setActivityTypeId("");
        setStartDate("");
        setEndDate("");
        setRegistrationDeadLine("");
        setStartTime("");
        setEndTime("");
        setDayOfWeek("");
        setMaxParticipants(0);
        setPrice(0);
        setPriceNote("");
        setIsOpen(false);
        setEditingActivity(null);

    }


    return (
        <div>
            <h1>ניהול פעילויות</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <div className="row">
                <input
                    type="text"
                    placeholder="שם הפעילות"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="row">
                <textarea
                    type="text"
                    placeholder="תיאור"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="text"
                    placeholder="קישור לתמונה"
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
                />
            </div>
            <div className="row">
                <select
                    value={activityTypeId}
                    onChange={(e) => setActivityTypeId(e.target.value)}
                >
                    <option value="">בחר סוג פעילות</option>
                    {activityTypes.map(type => (
                        <option key={type.id} value={type.id}>
                            {type.data.type_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="row">
                <input
                    type="date"
                    placeholder="תאריך התחלה"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="date"
                    placeholder="תאריך סיום"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="number"
                    placeholder="מספר משתתפים מקסימלי"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="date"
                    placeholder="תאריך אחרון להרשמה"
                    value={registrationDeadLine}
                    onChange={(e) => setRegistrationDeadLine(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="time"
                    placeholder="שעת התחלה"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="time"
                    placeholder="שעת סיום"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>
            <input
                type="text"
                placeholder="יום בשבוע"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
            />
            <div className="row">
                <input
                    type="number"
                    placeholder="מחיר"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="text"
                    placeholder="הערת מחיר"
                    value={priceNote}
                    onChange={(e) => setPriceNote(e.target.value)}
                />
            </div>
            <div className="row">
                <label>
                    <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={(e) => setIsOpen(e.target.checked)}
                    />
                    פתוח להרשמה
                </label>
            </div>
            <button onClick={editingActivity ? handleUpdateActivity : handleAddActivity}>
                {editingActivity ? "עדכון פעילות" : "הוספת פעילות"}
            </button>

            {editingActivity && (
                <button onClick={handleCancelEdit}>
                    ביטול עריכה
                </button>
            )}
            <div className="activities-container">
                {activities.map((activity) => (
                    <div className="activity-card" key={activity.id}>                        <h3>{activity.data.name}</h3>

                        <p>תיאור: {activity.data.description}</p>

                        <p>סוג פעילות: {activity.data.activity_type_id}</p>

                        <p>תאריך התחלה: {activity.data.start_date}</p>
                        <p>תאריך סיום: {activity.data.end_date}</p>

                        <p>תאריך אחרון להרשמה: {activity.data.registration_deadline}</p>

                        <p>שעת התחלה: {activity.data.start_time}</p>
                        <p>שעת סיום: {activity.data.end_time}</p>

                        <p>יום בשבוע: {activity.data.day_of_week}</p>

                        <p>מספר משתתפים: {activity.data.max_participants}</p>

                        <p>מחיר: {activity.data.price}</p>

                        <p>הערות מחיר: {activity.data.price_note}</p>

                        <p>סטטוס: {activity.data.is_open ? "פתוח" : "סגור"}</p>

                        <p><img
                            src={activity.data.image_url}
                            alt={activity.data.name}
                            width="200"
                        />
                        </p>

                        <button onClick={() => handleDeleteActivity(activity.id)}>
                            מחיקה
                        </button>
                        <button onClick={() => handleEditActivity(activity)}>
                            עריכה
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
export default ManageActivities;

