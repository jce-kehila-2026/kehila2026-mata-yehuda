import CancellationList from "../../components/cancellations/lists/CancellationList";

function ManageCancellations({ onNavigate }) {
    return (
        <div
            className="staff-page staff-page--cancellations list-mgmt-page"
            dir="rtl"
        >
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="list-mgmt-decoration list-mgmt-decoration--top"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="list-mgmt-decoration list-mgmt-decoration--left"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="list-mgmt-decoration list-mgmt-decoration--bottom"
            />

            <div className="staff-container staff-container--cancellations">
                <header className="list-mgmt-page__header">
                    <div className="list-mgmt-page__header-main">
                        <h1 className="list-mgmt-page__title">ניהול ביטולים</h1>
                        <p className="list-mgmt-page__subtitle">
                            ניהול בקשות ביטול, מעקב סטטוס והחזרים
                        </p>
                    </div>
                    {onNavigate ? (
                        <div className="list-mgmt-page__actions">
                            <button
                                type="button"
                                className="staff-back-button"
                                onClick={() => onNavigate("dashboard")}
                            >
                                <span
                                    className="staff-back-button__icon"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                                <span className="staff-back-button__label">
                                    חזרה ללוח הבקרה
                                </span>
                            </button>
                        </div>
                    ) : null}
                </header>

                <CancellationList />
            </div>
        </div>
    );
}

export default ManageCancellations;
