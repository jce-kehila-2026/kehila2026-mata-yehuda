import { useCallback, useMemo } from "react";
import { HandCoins, Plus } from "lucide-react";
import AdminDataTable from "../admin/AdminDataTable";
import AdminListEmptyState from "../admin/AdminListEmptyState";
import AdminListPagination from "../admin/AdminListPagination";
import AdminListSummary from "../admin/AdminListSummary";
import AdminListToolbar from "../admin/AdminListToolbar";
import AdminResponsiveList from "../admin/AdminResponsiveList";
import {
    AdminTableActions,
    AdminTableDeleteButton,
    AdminTableEditButton
} from "../admin/AdminTableActions";
import { useAdminList } from "../../hooks/useAdminList";
import {
    filterDonationsList,
    getDonationSortValue,
    getPaymentMethodLabel,
    timestampToDate
} from "../../services/donationService";

const DONATION_COLUMNS = [
    { key: "donor_name", label: "שם התורם", sortKey: "donor_name" },
    { key: "phone", label: "טלפון" },
    { key: "amount", label: "סכום תרומה", sortKey: "amount" },
    { key: "payment_method", label: "אמצעי תשלום" },
    { key: "donation_date", label: "תאריך", sortKey: "date" },
    { key: "notes", label: "הערות" },
    { key: "actions", label: "פעולות" }
];

function formatCurrency(value) {
    return new Intl.NumberFormat("he-IL", {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 0
    }).format(value ?? 0);
}

function formatDonationDate(value) {
    const date = timestampToDate(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

function DonationTable({
    donations = [],
    loading = false,
    error = "",
    actionMessage = "",
    hasPageFilters = false,
    onAddDonation,
    onEditDonation,
    onDeleteDonation
}) {
    const filterItems = useCallback(
        (items, searchQuery) => filterDonationsList(items, searchQuery),
        []
    );

    const list = useAdminList({
        sourceItems: donations,
        filterItems,
        totalCount: donations.length,
        getSortValue: getDonationSortValue,
        initialSortField: "date",
        initialSortDirection: "desc"
    });

    const emptyState = useMemo(() => {
        if (loading) {
            return null;
        }

        if (donations.length === 0) {
            return (
                <AdminListEmptyState
                    icon={HandCoins}
                    title="אין תרומות במערכת"
                    message="הוסיפו תרומה ראשונה כדי להתחיל לנהל את נתוני התרומות."
                    actionLabel={onAddDonation ? "הוסף תרומה" : undefined}
                    onAction={onAddDonation}
                />
            );
        }

        if (list.totalFiltered === 0) {
            return (
                <AdminListEmptyState
                    icon={HandCoins}
                    title="לא נמצאו תוצאות"
                    message={
                        hasPageFilters
                            ? "נסו לשנות את הסינון כדי למצוא תרומות אחרות."
                            : "נסו לשנות את החיפוש כדי למצוא תרומות אחרות."
                    }
                />
            );
        }

        return null;
    }, [loading, donations.length, hasPageFilters, list.totalFiltered, onAddDonation]);

    function renderDonationActions(donation) {
        return (
            <AdminTableActions>
                <AdminTableEditButton
                    onClick={() => onEditDonation?.(donation)}
                    label="עריכת תרומה"
                />
                <AdminTableDeleteButton
                    onClick={() => onDeleteDonation?.(donation)}
                    label="מחיקת תרומה"
                />
            </AdminTableActions>
        );
    }

    function renderMobileCard(donation) {
        return (
            <article key={donation.id} className="donations-card">
                <div className="donations-card__header">
                    <h3 className="donations-card__title">
                        {donation.donor_name || "—"}
                    </h3>
                    <span className="donations-card__amount">
                        {formatCurrency(donation.amount)}
                    </span>
                </div>
                <dl className="donations-card__details">
                    <div>
                        <dt>טלפון</dt>
                        <dd>{donation.phone || "—"}</dd>
                    </div>
                    <div>
                        <dt>אמצעי תשלום</dt>
                        <dd>{getPaymentMethodLabel(donation.payment_method)}</dd>
                    </div>
                    <div>
                        <dt>תאריך</dt>
                        <dd>{formatDonationDate(donation.donation_date)}</dd>
                    </div>
                    {donation.notes ? (
                        <div>
                            <dt>הערות</dt>
                            <dd>{donation.notes}</dd>
                        </div>
                    ) : null}
                </dl>
                <div className="donations-card__actions">
                    {renderDonationActions(donation)}
                </div>
            </article>
        );
    }

    return (
        <div className="donations-table-section admin-list-section">
            <div className="admin-list-header admin-list-header--split">
                <h2 className="admin-list-header__title">רשימת תרומות</h2>
                {onAddDonation ? (
                    <button
                        type="button"
                        className="staff-button staff-button--small admin-list-header__action admin-list-header__action--compact"
                        onClick={onAddDonation}
                    >
                        <Plus
                            className="admin-list-header__action-icon"
                            strokeWidth={2.25}
                            aria-hidden="true"
                        />
                        <span>הוסף תרומה</span>
                    </button>
                ) : null}
            </div>

            <AdminListToolbar
                layout="staff"
                searchId="donations-search"
                searchLabel="חיפוש"
                searchPlaceholder="שם תורם או טלפון"
                searchQuery={list.searchQuery}
                onSearchChange={list.setSearchQuery}
                pageSize={list.pageSize}
                onPageSizeChange={list.setPageSize}
                pageSizeLabel="הצג בעמוד"
            />

            <AdminListSummary
                totalCount={list.totalCount}
                totalFiltered={list.totalFiltered}
                pageCount={list.pageCount}
                page={list.page}
                totalPages={list.totalPages}
                showAll={list.showAll}
            />

            {error ? (
                <p className="staff-alert staff-alert--error">{error}</p>
            ) : null}
            {actionMessage ? (
                <p className="staff-alert staff-alert--success">{actionMessage}</p>
            ) : null}

            {loading ? <p className="donations-table__loading">טוען...</p> : null}

            {!loading && emptyState}

            {!loading && list.totalFiltered > 0 ? (
                <>
                    <AdminResponsiveList
                        desktopTable={
                            <AdminDataTable
                                ariaLabel="טבלת תרומות"
                                compact
                                columns={DONATION_COLUMNS}
                                sortField={list.sortField}
                                sortDirection={list.sortDirection}
                                onSort={list.handleSort}
                                rows={list.pageItems.map((donation) => (
                                    <tr key={donation.id}>
                                        <td className="admin-data-table__name-cell">
                                            {donation.donor_name || "—"}
                                        </td>
                                        <td className="admin-data-table__numeric">
                                            {donation.phone || "—"}
                                        </td>
                                        <td className="admin-data-table__numeric">
                                            {formatCurrency(donation.amount)}
                                        </td>
                                        <td>
                                            {getPaymentMethodLabel(
                                                donation.payment_method
                                            )}
                                        </td>
                                        <td>
                                            {formatDonationDate(
                                                donation.donation_date
                                            )}
                                        </td>
                                        <td className="donations-table__notes-cell">
                                            {donation.notes || "—"}
                                        </td>
                                        <td>{renderDonationActions(donation)}</td>
                                    </tr>
                                ))}
                            />
                        }
                        mobileCards={
                            <div className="donations-cards">
                                {list.pageItems.map(renderMobileCard)}
                            </div>
                        }
                    />

                    <AdminListPagination
                        page={list.page}
                        totalPages={list.totalPages}
                        onPageChange={list.setPage}
                    />
                </>
            ) : null}
        </div>
    );
}

export default DonationTable;
