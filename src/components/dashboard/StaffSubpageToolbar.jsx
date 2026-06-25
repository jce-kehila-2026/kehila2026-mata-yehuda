function StaffSubpageToolbar({ title, onBack }) {
    return (
        <div className="staff-subpage-toolbar" dir="ltr">
            <button
                type="button"
                className="staff-back-button"
                onClick={onBack}
                dir="rtl"
            >
                <span className="staff-back-button__icon" aria-hidden="true">
                    ←
                </span>
                <span className="staff-back-button__label">חזרה ללוח הבקרה</span>
            </button>
            <h2 className="staff-subpage-title" dir="rtl">
                {title}
            </h2>
        </div>
    );
}

export default StaffSubpageToolbar;
