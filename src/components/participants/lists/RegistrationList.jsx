import RegistrationCard from "./RegistrationCard";

function RegistrationList({ registrations, onCompleteRegistration }) {
    if (registrations.length === 0) {
        return <p>אין בקשות רישום להצגה</p>;
    }

    return (
        <div className="staff-grid staff-grid--cards staff-grid--detailed">
            {registrations.map((registration) => (
                <RegistrationCard
                    key={registration.registrationId || registration.id}
                    registration={registration}
                    onCompleteRegistration={onCompleteRegistration}
                />
            ))}
        </div>
    );
}

export default RegistrationList;
