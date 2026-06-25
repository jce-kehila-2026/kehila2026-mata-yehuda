import {
    formatStatisticsMonthDisplay,
    formatStatisticsMonthHebrewDisplay,
    STATISTICS_VIEW_MODE
} from "../../services/staffManegmentServices/statisticsService";

function StaffPeriodFilter({
    viewMode = STATISTICS_VIEW_MODE.MONTHLY,
    fromValue = "",
    toValue = "",
    validationError = "",
    onViewModeChange,
    onFromChange,
    onToChange,
    onApply,
    onReset
}) {
    const isMonthly = viewMode === STATISTICS_VIEW_MODE.MONTHLY;

    return (
        <section
            className="staff-statistics-filter-card"
            aria-label="סינון לפי תקופה"
        >
            <div className="staff-statistics-filter-card__head">
                <h2 className="staff-statistics-filter-card__title">
                    סינון לפי תקופה
                </h2>

                <div
                    className="staff-statistics-view-toggle"
                    role="tablist"
                    aria-label="סוג תצוגה"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isMonthly}
                        className={`staff-statistics-view-toggle__btn${
                            isMonthly
                                ? " staff-statistics-view-toggle__btn--active"
                                : ""
                        }`}
                        onClick={() =>
                            onViewModeChange?.(STATISTICS_VIEW_MODE.MONTHLY)
                        }
                    >
                        חודשית
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isMonthly}
                        className={`staff-statistics-view-toggle__btn${
                            !isMonthly
                                ? " staff-statistics-view-toggle__btn--active"
                                : ""
                        }`}
                        onClick={() =>
                            onViewModeChange?.(STATISTICS_VIEW_MODE.YEARLY)
                        }
                    >
                        שנתית
                    </button>
                </div>
            </div>

            <div className="staff-statistics-month-filter">
                <div className="staff-statistics-month-filter__inputs">
                    {isMonthly ? (
                        <>
                            <label className="staff-statistics-month-filter__field">
                                <span>מחודש</span>
                                <input
                                    type="month"
                                    className="staff-statistics-month-filter__month-input"
                                    aria-label="מחודש ושנה התחלה"
                                    value={fromValue}
                                    onChange={(event) =>
                                        onFromChange?.(event.target.value)
                                    }
                                />
                                <span className="staff-statistics-month-filter__preview">
                                    {fromValue
                                        ? `${formatStatisticsMonthDisplay(fromValue)} · ${formatStatisticsMonthHebrewDisplay(fromValue)}`
                                        : "\u00a0"}
                                </span>
                            </label>
                            <label className="staff-statistics-month-filter__field">
                                <span>עד חודש</span>
                                <input
                                    type="month"
                                    className="staff-statistics-month-filter__month-input"
                                    aria-label="מחודש ושנה סיום"
                                    value={toValue}
                                    onChange={(event) =>
                                        onToChange?.(event.target.value)
                                    }
                                />
                                <span className="staff-statistics-month-filter__preview">
                                    {toValue
                                        ? `${formatStatisticsMonthDisplay(toValue)} · ${formatStatisticsMonthHebrewDisplay(toValue)}`
                                        : "\u00a0"}
                                </span>
                            </label>
                        </>
                    ) : (
                        <>
                            <label className="staff-statistics-month-filter__field">
                                <span>משנה</span>
                                <input
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    step="1"
                                    inputMode="numeric"
                                    placeholder="YYYY"
                                    value={fromValue}
                                    onChange={(event) =>
                                        onFromChange?.(event.target.value)
                                    }
                                />
                            </label>
                            <label className="staff-statistics-month-filter__field">
                                <span>עד שנה</span>
                                <input
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    step="1"
                                    inputMode="numeric"
                                    placeholder="YYYY"
                                    value={toValue}
                                    onChange={(event) =>
                                        onToChange?.(event.target.value)
                                    }
                                />
                            </label>
                        </>
                    )}
                </div>
                <div className="staff-statistics-month-filter__actions">
                    <button
                        type="button"
                        className="staff-statistics-month-filter__submit"
                        onClick={onApply}
                    >
                        הצג נתונים
                    </button>
                    <button
                        type="button"
                        className="staff-statistics-month-filter__reset"
                        onClick={onReset}
                    >
                        איפוס
                    </button>
                </div>
            </div>

            {validationError ? (
                <p
                    className="staff-statistics-month-filter__error"
                    role="alert"
                >
                    {validationError}
                </p>
            ) : null}
        </section>
    );
}

export default StaffPeriodFilter;
