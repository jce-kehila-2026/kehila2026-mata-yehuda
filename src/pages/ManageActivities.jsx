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
            setError("Activity name is required");
            setSuccess("");
            return false;
        }

        if (!description.trim()) {
            setError("Description is required");
            setSuccess("");
            return false;
        }

        if (!activityTypeId) {
            setError("Please select activity type");
            setSuccess("");
            return false;
        }

        if (!startDate) {
            setError("Start date is required");
            setSuccess("");
            return false;
        }

        if (!endDate) {
            setError("End date is required");
            setSuccess("");
            return false;
        }

        if (Number(maxParticipants) <= 0) {
            setError("Max participants must be greater than 0");
            setSuccess("");
            return false;
        }

        if (Number(price) < 0) {
            setError("Price cannot be negative");
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
        setSuccess("Activity added successfully");
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
        setSuccess("Activity deleted successfully");
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
        setSuccess("Activity updated successfully");
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
            <h1>Manage Activities</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <div className="row">
                <input
                    type="text"
                    placeholder="Activity Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="row">
                <textarea
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="text"
                    placeholder="Image URL"
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
                />
            </div>
            <div className="row">
                <select
                    value={activityTypeId}
                    onChange={(e) => setActivityTypeId(e.target.value)}
                >
                    <option value="">Select Activity Type</option>
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
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="number"
                    placeholder="Max Participants"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="date"
                    placeholder="Registration Deadline"
                    value={registrationDeadLine}
                    onChange={(e) => setRegistrationDeadLine(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="time"
                    placeholder="Start Time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="time"
                    placeholder="End Time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>
            <input
                type="text"
                placeholder="Day Of Week"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
            />
            <div className="row">
                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </div>
            <div className="row">
                <input
                    type="text"
                    placeholder="Price Note"
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
                    Open For Registration
                </label>
            </div>
            <button onClick={editingActivity ? handleUpdateActivity : handleAddActivity}>
                {editingActivity ? "Update Activity" : "Add Activity"}
            </button>

            {editingActivity && (
                <button onClick={handleCancelEdit}>
                    Cancel Edit
                </button>
            )}
            <div className="activities-container">
                {activities.map((activity) => (
                    <div className="activity-card" key={activity.id}>                        <h3>{activity.data.name}</h3>

                        <p>Description: {activity.data.description}</p>

                        <p>Activity Type: {activity.data.activity_type_id}</p>

                        <p>Start Date: {activity.data.start_date}</p>
                        <p>End Date: {activity.data.end_date}</p>

                        <p>Registration Deadline: {activity.data.registration_deadline}</p>

                        <p>Start Time: {activity.data.start_time}</p>
                        <p>End Time: {activity.data.end_time}</p>

                        <p>Day Of Week: {activity.data.day_of_week}</p>

                        <p>Max Participants: {activity.data.max_participants}</p>

                        <p>Price: {activity.data.price}</p>

                        <p>Price Note: {activity.data.price_note}</p>

                        <p>Status: {activity.data.is_open ? "Open" : "Closed"}</p>

                        <p><img
                            src={activity.data.image_url}
                            alt={activity.data.name}
                            width="200"
                        />
                        </p>

                        <button onClick={() => handleDeleteActivity(activity.id)}>
                            Delete
                        </button>
                        <button onClick={() => handleEditActivity(activity)}>
                            Edit
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
export default ManageActivities;

