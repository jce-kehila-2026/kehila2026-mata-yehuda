import { useCallback, useEffect, useMemo, useState } from "react";
import DonationFilters from "../../components/donations/DonationFilters";
import DonationForm from "../../components/donations/DonationForm";
import DonationSummary from "../../components/donations/DonationSummary";
import DonationTable from "../../components/donations/DonationTable";
import {
    addDonation,
    deleteDonation,
    DONATION_EMPTY_FILTERS,
    filterDonationsByCriteria,
    getDonations,
    hasActiveDonationFilters,
    updateDonation
} from "../../services/donationService";

function ManageDonations() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDonation, setEditingDonation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filters, setFilters] = useState(DONATION_EMPTY_FILTERS);

    const filteredDonations = useMemo(
        () => filterDonationsByCriteria(donations, filters),
        [donations, filters]
    );

    const chartFilters = useMemo(
        () => ({
            month: filters.month,
            year: filters.year
        }),
        [filters.month, filters.year]
    );

    const hasPageFilters = hasActiveDonationFilters(filters);

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

    function handleClearFilters() {
        setFilters(DONATION_EMPTY_FILTERS);
    }

    return (
        <div className="staff-page staff-page--donations">
            <div className="staff-container staff-container--donations">
                <DonationSummary
                    donations={filteredDonations}
                    chartFilters={chartFilters}
                    filtersPanel={
                        <DonationFilters
                            donations={donations}
                            filters={filters}
                            onFilterChange={setFilters}
                            onClearFilters={handleClearFilters}
                        />
                    }
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
