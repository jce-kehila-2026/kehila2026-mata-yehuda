import {
    ADMIN_PAGE_SIZE_ALL,
    ADMIN_PAGE_SIZE_OPTIONS
} from "../../utils/adminListUtils";

function AdminListToolbar({
    searchId,
    searchLabel,
    searchPlaceholder,
    searchQuery,
    onSearchChange,
    filters,
    pageSize,
    onPageSizeChange,
    pageSizeLabel = "הצג בעמוד",
    layout = "default"
}) {
    return (
        <div
            className={[
                "admin-list-toolbar",
                "staff-form",
                "staff-list-filters",
                layout === "participants" && "admin-list-toolbar--participants-bar",
                layout === "staff" && "admin-list-toolbar--staff-bar",
                layout === "cancellations" && "admin-list-toolbar--cancellations-bar",
                layout === "inline" && "admin-list-toolbar--inline"
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="admin-list-toolbar__search">
                <label htmlFor={searchId}>{searchLabel}</label>
                <input
                    id={searchId}
                    type="search"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </div>

            {filters ? <div className="admin-list-toolbar__filters">{filters}</div> : null}

            <div className="admin-list-toolbar__page-size">
                <label htmlFor={`${searchId}-page-size`}>{pageSizeLabel}</label>
                <select
                    id={`${searchId}-page-size`}
                    value={String(pageSize)}
                    onChange={(event) => onPageSizeChange(event.target.value)}
                >
                    {ADMIN_PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                    <option value={ADMIN_PAGE_SIZE_ALL}>הכל</option>
                </select>
            </div>
        </div>
    );
}

export default AdminListToolbar;
