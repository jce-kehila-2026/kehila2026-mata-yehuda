import CancellationList from "../../components/cancellations/lists/CancellationList";

function ManageCancellations() {
    return (
        <div className="staff-page staff-page--cancellations">
            <div className="staff-container staff-container--cancellations">
                <section className="staff-section staff-section--list staff-section--cancellations-list">
                    <CancellationList />
                </section>
            </div>
        </div>
    );
}

export default ManageCancellations;
