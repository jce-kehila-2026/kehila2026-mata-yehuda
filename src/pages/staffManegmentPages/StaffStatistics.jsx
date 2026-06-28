import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { Loader2 } from "lucide-react";
import StaffPeriodFilter from "../../components/staff/StaffPeriodFilter";
import {
    STATISTICS_VIEW_MODE,
    fetchStaffStatistics,
    getStatisticsRangeValidationMessage,
    isInvalidStatisticsRange,
    resolveStatisticsFilter
} from "../../services/staffManegmentServices/statisticsService";
import "../../styles/staffManegmentStyles/staffStatistics.css";

const CHART_HEIGHT = 220;
const CHART_HEIGHT_BAR = CHART_HEIGHT;
const CHART_HEIGHT_PIE = 155;
const CHART_MARGINS = { top: 4, right: 20, left: 4, bottom: 4 };
const CHART_MARGINS_SINGLE_BAR = { top: 12, right: 20, left: 4, bottom: 4 };

const CHART_COLORS = ["#1B5E20", "#2E7D32", "#43A047", "#66BB6A", "#81C784"];

const TOP_ACTIVITY_CHART_LIMIT = 10;
const TOP_ACTIVITY_CHART_NOTE = "מוצגות 10 הפעילויות המובילות";
const CORE_PROGRAM_ORDER = ["מרכז יום", "60+", "קהילה תומכת"];
const CORE_PROGRAM_LABELS = new Set(CORE_PROGRAM_ORDER);
const OTHER_PROGRAM_LABEL = "אחר";

const SUMMARY_ITEMS = [
    { key: "participants", label: 'סה״כ משתתפים בתקופה' },
    { key: "registrations", label: 'סה״כ הרשמות בתקופה' },
    { key: "cancellations", label: 'סה״כ ביטולים בתקופה' },
    { key: "activities", label: 'סה״כ פעילויות בתקופה' }
];

const DEFAULT_APPLIED_FILTER = {
    mode: STATISTICS_VIEW_MODE.MONTHLY,
    from: "",
    to: ""
};

function formatCount(value) {
    return new Intl.NumberFormat("he-IL").format(value ?? 0);
}

function StatisticsTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="staff-statistics-tooltip">
            <strong>{label || payload[0]?.name}</strong>
            <span>{formatCount(payload[0]?.value)}</span>
        </div>
    );
}

function StaffStatistics({ onBack }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState(null);
    const [viewMode, setViewMode] = useState(STATISTICS_VIEW_MODE.MONTHLY);
    const [fromValue, setFromValue] = useState("");
    const [toValue, setToValue] = useState("");
    const [appliedFilter, setAppliedFilter] = useState(DEFAULT_APPLIED_FILTER);
    const [rangeValidationError, setRangeValidationError] = useState("");

    const resolvedRange = useMemo(
        () =>
            resolveStatisticsFilter(
                appliedFilter.mode,
                appliedFilter.from,
                appliedFilter.to
            ),
        [appliedFilter]
    );

    const activeDateRange = resolvedRange.range;

    const inputValidationError = useMemo(() => {
        if (isInvalidStatisticsRange(viewMode, fromValue, toValue)) {
            return getStatisticsRangeValidationMessage(viewMode);
        }

        return "";
    }, [viewMode, fromValue, toValue]);

    const loadStatistics = useCallback(async () => {
        if (!activeDateRange || resolvedRange.error) {
            setStats(null);
            setLoading(false);
            setError("");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await fetchStaffStatistics(
                activeDateRange,
                appliedFilter.mode
            );
            setStats(data);
        } catch (loadError) {
            console.error(loadError);
            setError("לא ניתן לטעון את הנתונים כרגע. נסו לרענן את העמוד.");
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [activeDateRange, resolvedRange.error, appliedFilter.mode]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const handleApplyFilter = () => {
        if (inputValidationError) {
            setRangeValidationError(inputValidationError);
            return;
        }

        setRangeValidationError("");
        setAppliedFilter({ mode: viewMode, from: fromValue, to: toValue });
    };

    const handleResetFilter = () => {
        setViewMode(STATISTICS_VIEW_MODE.MONTHLY);
        setFromValue("");
        setToValue("");
        setAppliedFilter(DEFAULT_APPLIED_FILTER);
        setRangeValidationError("");
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setFromValue("");
        setToValue("");
        setAppliedFilter({ mode, from: "", to: "" });
        setRangeValidationError("");
    };

    const timeSeriesTitle =
        appliedFilter.mode === STATISTICS_VIEW_MODE.YEARLY
            ? "הרשמות לפי שנה"
            : "הרשמות לפי חודש";

    const hasProgramData = (stats?.registrationsByProgram?.length ?? 0) > 0;
    const isSingleMonthPeriod =
        appliedFilter.mode === STATISTICS_VIEW_MODE.MONTHLY &&
        (stats?.registrationsOverTime?.length ?? 0) === 1;
    const timeSeriesData = stats?.registrationsOverTime ?? [];
    const showSingleMonthBar =
        isSingleMonthPeriod && timeSeriesData.length === 1;
    const showTimeSeriesLine = timeSeriesData.length > 1;

    const showTopRegistrationsNote =
        (stats?.totals?.activities ?? 0) > TOP_ACTIVITY_CHART_LIMIT;
    const showTopCancellationsNote =
        (stats?.totalActivitiesWithCancellations ?? 0) >
        TOP_ACTIVITY_CHART_LIMIT;

    const pieData = useMemo(() => {
        const items = stats?.registrationsByProgram ?? [];
        const total = items.reduce((sum, item) => sum + item.count, 0);

        if (total === 0) {
            return [];
        }

        const coreCounts = new Map();
        let otherCount = 0;

        items.forEach((item) => {
            if (CORE_PROGRAM_LABELS.has(item.label)) {
                coreCounts.set(
                    item.label,
                    (coreCounts.get(item.label) || 0) + item.count
                );
                return;
            }

            otherCount += item.count;
        });

        const segments = CORE_PROGRAM_ORDER.map((label) => {
                const value = coreCounts.get(label) || 0;

                if (value <= 0) {
                    return null;
                }

                return {
                    name: label,
                    value,
                    percent: Math.round((value / total) * 100)
                };
            })
            .filter(Boolean);

        if (otherCount > 0) {
            segments.push({
                name: OTHER_PROGRAM_LABEL,
                value: otherCount,
                percent: Math.round((otherCount / total) * 100)
            });
        }

        return segments.sort((a, b) => b.value - a.value);
    }, [stats]);

    const getPieColor = (index) =>
        CHART_COLORS[index % CHART_COLORS.length];

    const displayValidationError =
        inputValidationError || rangeValidationError;

    return (
        <div className="staff-statistics-page" dir="rtl">
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="staff-statistics-decoration staff-statistics-decoration--top"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="staff-statistics-decoration staff-statistics-decoration--left"
            />
            <img
                src="/images/minitree.png"
                alt=""
                aria-hidden="true"
                className="staff-statistics-decoration staff-statistics-decoration--bottom"
            />

            <div className="staff-statistics-container">
                <header className="staff-statistics-header">
                    <div className="staff-statistics-header__intro">
                        <h1 className="staff-statistics-header__title">
                            סטטיסטיקות
                        </h1>
                        <p className="staff-statistics-header__subtitle">
                            סקירת פעילות, הרשמות וביטולים לפי תקופה
                        </p>
                    </div>
                    {onBack ? (
                        <div className="staff-statistics-header__actions">
                            <button
                                type="button"
                                className="staff-back-button"
                                onClick={onBack}
                            >
                                <span
                                    className="staff-back-button__icon"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                                <span className="staff-back-button__label">
                                    חזרה ללוח הבקרה
                                </span>
                            </button>
                        </div>
                    ) : null}
                </header>

                <div className="staff-statistics-content">
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

                {loading ? (
                    <div className="staff-statistics-state" role="status">
                        <Loader2
                            className="staff-statistics-state__spinner"
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        <p>טוען נתונים…</p>
                    </div>
                ) : null}

                {!loading && error ? (
                    <div className="staff-statistics-state staff-statistics-state--error">
                        <p>{error}</p>
                    </div>
                ) : null}

                {!loading && !error && stats ? (
                    <div className="staff-statistics-dashboard">
                        <section
                            className="staff-statistics-summary-grid"
                            aria-label="סיכום כללי"
                        >
                            {SUMMARY_ITEMS.map((item) => (
                                <article
                                    key={item.key}
                                    className="staff-statistics-summary-card"
                                >
                                    <span className="staff-statistics-summary-card__value">
                                        {formatCount(stats.totals[item.key])}
                                    </span>
                                    <span className="staff-statistics-summary-card__label">
                                        {item.label}
                                    </span>
                                </article>
                            ))}
                        </section>

                        <div className="staff-statistics-charts-grid">
                            <section className="staff-statistics-card">
                                <h2 className="staff-statistics-card__title">
                                    הרשמות לפי פעילויות
                                </h2>
                                {stats.topActivitiesByRegistrations.length > 0 ? (
                                    <>
                                        <div className="staff-statistics-chart staff-statistics-chart--bar">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={CHART_HEIGHT_BAR}
                                        >
                                            <BarChart
                                                data={
                                                    stats.topActivitiesByRegistrations
                                                }
                                                layout="vertical"
                                                margin={CHART_MARGINS}
                                                barCategoryGap="18%"
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#E8F5E9"
                                                    horizontal={false}
                                                />
                                                <XAxis
                                                    type="number"
                                                    allowDecimals={false}
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#6B7280"
                                                    }}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={110}
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#6B7280"
                                                    }}
                                                />
                                                <Tooltip
                                                    content={<StatisticsTooltip />}
                                                />
                                                <Bar
                                                    dataKey="count"
                                                    fill="#2E7D32"
                                                    radius={[0, 8, 8, 0]}
                                                    barSize={16}
                                                    name="הרשמות"
                                                >
                                                    <LabelList
                                                        dataKey="count"
                                                        position="right"
                                                        fill="#1F2937"
                                                        fontSize={11}
                                                        fontWeight={700}
                                                    />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {showTopRegistrationsNote ? (
                                        <p className="staff-statistics-chart-note">
                                            {TOP_ACTIVITY_CHART_NOTE}
                                        </p>
                                    ) : null}
                                    </>
                                ) : (
                                    <p className="staff-statistics-empty">
                                        אין נתונים להצגה
                                    </p>
                                )}
                            </section>

                            <section className="staff-statistics-card">
                                <h2 className="staff-statistics-card__title">
                                    הרשמות לפי תוכנית
                                </h2>
                                {hasProgramData ? (
                                    <div className="staff-statistics-pie-layout">
                                        <div className="staff-statistics-pie-layout__chart">
                                            <ResponsiveContainer
                                                width="100%"
                                                height={CHART_HEIGHT_PIE}
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={38}
                                                        outerRadius={60}
                                                        paddingAngle={2}
                                                        stroke="#ffffff"
                                                        strokeWidth={2}
                                                    >
                                                        {pieData.map(
                                                            (entry, index) => (
                                                                <Cell
                                                                    key={
                                                                        entry.name
                                                                    }
                                                                    fill={getPieColor(
                                                                        index
                                                                    )}
                                                                />
                                                            )
                                                        )}
                                                    </Pie>
                                                    <Tooltip
                                                        content={
                                                            <StatisticsTooltip />
                                                        }
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <ul className="staff-statistics-pie-legend">
                                            {pieData.map((entry, index) => (
                                                <li
                                                    key={entry.name}
                                                    className="staff-statistics-pie-legend__item"
                                                >
                                                    <span
                                                        className="staff-statistics-pie-legend__dot"
                                                        style={{
                                                            backgroundColor:
                                                                getPieColor(
                                                                    index
                                                                )
                                                        }}
                                                        aria-hidden="true"
                                                    />
                                                    <span className="staff-statistics-pie-legend__label">
                                                        {entry.name} –{" "}
                                                        {entry.percent}%
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="staff-statistics-empty">
                                        אין נתונים להצגה
                                    </p>
                                )}
                            </section>

                            <section className="staff-statistics-card">
                                <h2 className="staff-statistics-card__title">
                                    ביטולים לפי פעילויות
                                </h2>
                                {stats.cancellationsByActivity.length > 0 ? (
                                    <>
                                        <div className="staff-statistics-chart staff-statistics-chart--bar">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={CHART_HEIGHT_BAR}
                                        >
                                            <BarChart
                                                data={
                                                    stats.cancellationsByActivity
                                                }
                                                layout="vertical"
                                                margin={CHART_MARGINS}
                                                barCategoryGap="18%"
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#E8F5E9"
                                                    horizontal={false}
                                                />
                                                <XAxis
                                                    type="number"
                                                    allowDecimals={false}
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#6B7280"
                                                    }}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={110}
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#6B7280"
                                                    }}
                                                />
                                                <Tooltip
                                                    content={<StatisticsTooltip />}
                                                />
                                                <Bar
                                                    dataKey="count"
                                                    fill="#C62828"
                                                    radius={[0, 8, 8, 0]}
                                                    barSize={16}
                                                    name="ביטולים"
                                                >
                                                    <LabelList
                                                        dataKey="count"
                                                        position="right"
                                                        fill="#1F2937"
                                                        fontSize={11}
                                                        fontWeight={700}
                                                    />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {showTopCancellationsNote ? (
                                        <p className="staff-statistics-chart-note">
                                            {TOP_ACTIVITY_CHART_NOTE}
                                        </p>
                                    ) : null}
                                    </>
                                ) : (
                                    <p className="staff-statistics-empty">
                                        אין ביטולים בתקופה זו
                                    </p>
                                )}
                            </section>

                            <section className="staff-statistics-card">
                                <h2 className="staff-statistics-card__title">
                                    {timeSeriesTitle}
                                </h2>
                                {showSingleMonthBar ? (
                                    <div className="staff-statistics-chart staff-statistics-chart--bar">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={CHART_HEIGHT}
                                        >
                                            <BarChart
                                                data={timeSeriesData}
                                                margin={CHART_MARGINS_SINGLE_BAR}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#E8F5E9"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="label"
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#6B7280"
                                                    }}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#6B7280"
                                                    }}
                                                />
                                                <Tooltip
                                                    content={<StatisticsTooltip />}
                                                />
                                                <Bar
                                                    dataKey="count"
                                                    fill="#2E7D32"
                                                    radius={[8, 8, 0, 0]}
                                                    barSize={72}
                                                    maxBarSize={96}
                                                    name="הרשמות"
                                                >
                                                    <LabelList
                                                        dataKey="count"
                                                        position="top"
                                                        fill="#1F2937"
                                                        fontSize={11}
                                                        fontWeight={700}
                                                    />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : showTimeSeriesLine ? (
                                    <div className="staff-statistics-chart staff-statistics-chart--line">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={CHART_HEIGHT}
                                        >
                                            <LineChart
                                                data={stats.registrationsOverTime}
                                                margin={CHART_MARGINS}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#E8F5E9"
                                                />
                                                <XAxis
                                                    dataKey="label"
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#6B7280"
                                                    }}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#6B7280"
                                                    }}
                                                />
                                                <Tooltip
                                                    content={<StatisticsTooltip />}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="#2E7D32"
                                                    strokeWidth={2}
                                                    dot={{
                                                        r: 3,
                                                        fill: "#2E7D32",
                                                        strokeWidth: 0
                                                    }}
                                                    activeDot={{ r: 5 }}
                                                    name="הרשמות"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="staff-statistics-empty">
                                        אין נתונים להצגה
                                    </p>
                                )}
                            </section>
                        </div>
                    </div>
                ) : null}
                </div>
            </div>
        </div>
    );
}

export default StaffStatistics;
