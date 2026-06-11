function AdminListSummary({
    totalCount,
    totalFiltered,
    pageCount,
    page,
    totalPages,
    showAll = false
}) {
    return (
        <div className="admin-list-summary">
            <p className="staff-list-count admin-list-summary__text">
                סה״כ רשומות: {totalCount} · לאחר סינון: {totalFiltered} ·{" "}
                {showAll ? `מוצגים: ${pageCount}` : `בעמוד הנוכחי: ${pageCount}`}
            </p>
            {!showAll ? (
                <p className="admin-list-summary__page">
                    עמוד {page} מתוך {totalPages}
                </p>
            ) : null}
        </div>
    );
}

export default AdminListSummary;
