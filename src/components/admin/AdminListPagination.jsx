function AdminListPagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    const visiblePages = pages.filter((pageNumber) => {
        if (totalPages <= 7) {
            return true;
        }

        return (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            Math.abs(pageNumber - page) <= 1
        );
    });

    return (
        <nav className="admin-list-pagination" aria-label="ניווט עמודים">
            <button
                type="button"
                className="staff-button staff-button--small staff-button--secondary"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
            >
                הקודם
            </button>

            <div className="admin-list-pagination__pages">
                {visiblePages.map((pageNumber, index) => {
                    const previousPage = visiblePages[index - 1];
                    const showEllipsis = previousPage && pageNumber - previousPage > 1;

                    return (
                        <span key={pageNumber} className="admin-list-pagination__page-group">
                            {showEllipsis ? (
                                <span className="admin-list-pagination__ellipsis">…</span>
                            ) : null}
                            <button
                                type="button"
                                className={
                                    pageNumber === page
                                        ? "admin-list-pagination__page admin-list-pagination__page--active"
                                        : "admin-list-pagination__page"
                                }
                                onClick={() => onPageChange(pageNumber)}
                                aria-current={pageNumber === page ? "page" : undefined}
                            >
                                {pageNumber}
                            </button>
                        </span>
                    );
                })}
            </div>

            <button
                type="button"
                className="staff-button staff-button--small staff-button--secondary"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
            >
                הבא
            </button>
        </nav>
    );
}

export default AdminListPagination;
