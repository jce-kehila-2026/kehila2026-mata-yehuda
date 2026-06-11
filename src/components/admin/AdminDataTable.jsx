function AdminDataTable({ columns, rows, sortField, sortDirection, onSort, ariaLabel, compact = false }) {
    return (
        <div
            className={
                compact
                    ? "staff-table-wrap admin-data-table-wrap admin-data-table-wrap--compact"
                    : "staff-table-wrap admin-data-table-wrap"
            }
        >
            <table
                className={
                    compact
                        ? "admin-data-table admin-data-table--compact"
                        : "admin-data-table"
                }
                aria-label={ariaLabel}
            >
                <thead>
                    <tr>
                        {columns.map((column) => {
                            const isSortable = Boolean(column.sortKey && onSort);
                            const isActive = sortField === column.sortKey;

                            return (
                                <th key={column.key} scope="col">
                                    {isSortable ? (
                                        <button
                                            type="button"
                                            className={
                                                isActive
                                                    ? "admin-data-table__sort admin-data-table__sort--active"
                                                    : "admin-data-table__sort"
                                            }
                                            onClick={() => onSort(column.sortKey)}
                                        >
                                            <span>{column.label}</span>
                                            <span className="admin-data-table__sort-indicator" aria-hidden="true">
                                                {isActive
                                                    ? sortDirection === "asc"
                                                        ? "↑"
                                                        : "↓"
                                                    : "↕"}
                                            </span>
                                        </button>
                                    ) : (
                                        column.label
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        </div>
    );
}

export default AdminDataTable;
