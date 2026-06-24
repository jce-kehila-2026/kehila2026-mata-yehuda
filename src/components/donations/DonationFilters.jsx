import { useMemo } from "react";
import {
    DONATION_MONTH_OPTIONS,
    getDonationYearOptions,
    hasActiveDonationFilters
} from "../../services/donationService";

function DonationFilters({
    donations = [],
    filters,
    onFilterChange,
    onClearFilters
}) {
    const yearOptions = useMemo(
        () => getDonationYearOptions(donations),
        [donations]
    );
    const hasFilters = hasActiveDonationFilters(filters);

    function handleChange(field) {
        return (event) => {
            onFilterChange({
                ...filters,
                [field]: event.target.value
            });
        };
    }

    return (
        <section className="donations-filters" aria-label="סינון תרומות">
            <h3 className="donations-filters__title">סינון תרומות</h3>
            <div className="donations-filters__grid staff-form">
                <div className="donations-filters__field">
                    <label htmlFor="donations-filter-year">שנה</label>
                    <select
                        id="donations-filter-year"
                        value={filters.year}
                        onChange={handleChange("year")}
                    >
                        <option value="">כל השנים</option>
                        {yearOptions.map((year) => (
                            <option key={year} value={String(year)}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="donations-filters__field">
                    <label htmlFor="donations-filter-month">חודש</label>
                    <select
                        id="donations-filter-month"
                        value={filters.month}
                        onChange={handleChange("month")}
                    >
                        <option value="">כל החודשים</option>
                        {DONATION_MONTH_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="donations-filters__field donations-filters__field--wide">
                    <label htmlFor="donations-filter-donor">שם תורם</label>
                    <input
                        id="donations-filter-donor"
                        type="search"
                        placeholder="חיפוש לפי שם תורם"
                        value={filters.donorName}
                        onChange={handleChange("donorName")}
                    />
                </div>

                <div className="donations-filters__field">
                    <label htmlFor="donations-filter-min">סכום מינימלי</label>
                    <input
                        id="donations-filter-min"
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        placeholder="מ-"
                        value={filters.minAmount}
                        onChange={handleChange("minAmount")}
                    />
                </div>

                <div className="donations-filters__field">
                    <label htmlFor="donations-filter-max">סכום מקסימלי</label>
                    <input
                        id="donations-filter-max"
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        placeholder="עד"
                        value={filters.maxAmount}
                        onChange={handleChange("maxAmount")}
                    />
                </div>

                <div className="donations-filters__actions">
                    <button
                        type="button"
                        className="staff-button staff-button--secondary donations-filters__clear"
                        onClick={onClearFilters}
                        disabled={!hasFilters}
                    >
                        ניקוי סינון
                    </button>
                </div>
            </div>
        </section>
    );
}

export default DonationFilters;
