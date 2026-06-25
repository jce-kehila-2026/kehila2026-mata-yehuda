import { useCallback, useEffect, useMemo, useState } from "react";
import StaffPeriodFilter from "../../components/staff/StaffPeriodFilter";
import DonationForm from "../../components/donations/DonationForm";
import DonationSummary from "../../components/donations/DonationSummary";
import DonationTable from "../../components/donations/DonationTable";
import {
    addDonation,
    DEFAULT_DONATION_PERIOD_FILTER,
    deleteDonation,
    filterDonationsByPeriod,
    getDonations,
    hasCustomDonationPeriodFilter,
    updateDonation
} from "../../services/donationService";
import {
    getStatisticsRangeValidationMessage,
    isInvalidStatisticsRange,
    STATISTICS_VIEW_MODE
} from "../../services/staffManegmentServices/statisticsService";

function ManageDonations() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDonation, setEditingDonation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState(STATISTICS_VIEW_MODE.MONTHLY);
    const [fromValue, setFromValue] = useState("");
    const [toValue, setToValue] = useState("");
    const [appliedFilter, setAppliedFilter] = useState(
        DEFAULT_DONATION_PERIOD_FILTER
    );
    const [rangeValidationError, setRangeValidationError] = useState("");

    const inputValidationError = useMemo(() => {
        if (isInvalidStatisticsRange(viewMode, fromValue, toValue)) {
            return getStatisticsRangeValidationMessage(viewMode);
        }

        return "";
    }, [viewMode, fromValue, toValue]);

    const filteredDonations = useMemo(
        () => filterDonationsByPeriod(donations, appliedFilter),
        [donations, appliedFilter]
    );

    const hasPageFilters = hasCustomDonationPeriodFilter(appliedFilter);

    const loadDonations = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const records = await getDonations();
            setDonations(records);
        } catch (loadError) {
            console.error(loadError);
            setError("שגיאה בטעינת התרומות");
            setDonations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDonations();
    }, [loadDonations]);

    function handleApplyFilter() {
        if (inputValidationError) {
            setRangeValidationError(inputValidationError);
            return;
        }

        setRangeValidationError("");
        setAppliedFilter({ mode: viewMode, from: fromValue, to: toValue });
    }

    function handleResetFilter() {
        setViewMode(STATISTICS_VIEW_MODE.MONTHLY);
        setFromValue("");
        setToValue("");
        setAppliedFilter(DEFAULT_DONATION_PERIOD_FILTER);
        setRangeValidationError("");
    }

    function handleViewModeChange(mode) {
        setViewMode(mode);
        setFromValue("");
        setToValue("");
        setAppliedFilter({ mode, from: "", to: "" });
        setRangeValidationError("");
    }

    function handleAddClick() {
        setEditingDonation(null);
        setIsFormOpen(true);
    }

    function handleEditClick(donation) {
        setEditingDonation(donation);
        setIsFormOpen(true);
    }

    function handleCloseForm() {
        if (isSubmitting) {
            return;
        }

        setIsFormOpen(false);
        setEditingDonation(null);
    }

    async function handleFormSubmit(formData) {
        setIsSubmitting(true);
        setActionMessage("");

        try {
            if (editingDonation?.id) {
                await updateDonation(editingDonation.id, formData);
                setActionMessage("התרומה עודכנה בהצלחה");
            } else {
                await addDonation(formData);
                setActionMessage("התרומה נוספה בהצלחה");
            }

            setIsFormOpen(false);
            setEditingDonation(null);
            await loadDonations();
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteClick(donation) {
        const confirmed = window.confirm(
            `האם למחוק את התרומה של ${donation.donor_name || "התורם"}?`
        );

        if (!confirmed) {
            return;
        }

        setActionMessage("");

        try {
            await deleteDonation(donation.id);
            setActionMessage("התרומה נמחקה בהצלחה");
            await loadDonations();
        } catch (deleteError) {
            console.error(deleteError);
            setError("שגיאה במחיקת התרומה");
        }
    }

    const displayValidationError =
        inputValidationError || rangeValidationError;

    return (
        <div className="staff-page staff-page--donations" dir="rtl">
            <div className="staff-container staff-container--donations">
                <StaffPeriodFilter
                    viewMode={viewMode}
                    fromValue={fromValue}
                    toValue={toValue}
                    validationError={displayValidationError}
                    onViewModeChange={handleViewModeChange}
                    onFromChange={(value) => {
                        setFromValue(value);
                        setRangeValidationError("");
                    }}
                    onToChange={(value) => {
                        setToValue(value);
                        setRangeValidationError("");
                    }}
                    onApply={handleApplyFilter}
                    onReset={handleResetFilter}
                />

                <DonationSummary
                    donations={filteredDonations}
                    periodFilter={appliedFilter}
                />

                <section className="staff-section staff-section--list staff-section--donations-list">
                    <DonationTable
                        donations={filteredDonations}
                        hasPageFilters={hasPageFilters}
                        loading={loading}
                        error={error}
                        actionMessage={actionMessage}
                        onAddDonation={handleAddClick}
                        onEditDonation={handleEditClick}
                        onDeleteDonation={handleDeleteClick}
                    />
                </section>
            </div>

            <DonationForm
                isOpen={isFormOpen}
                donation={editingDonation}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

export default ManageDonations;
