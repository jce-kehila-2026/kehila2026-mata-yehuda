import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Legend,
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
import { fetchStaffStatistics } from "../../services/staffManegmentServices/statisticsService";
import "../../styles/staffManegmentStyles/staffStatistics.css";

const CHART_COLORS = ["#1B5E20", "#2E7D32", "#43A047", "#66BB6A", "#81C784"];

const SUMMARY_ITEMS = [
    { key: "participants", label: 'סה"כ משתתפים' },
    { key: "activities", label: 'סה"כ פעילויות' },
    { key: "registrations", label: 'סה"כ הרשמות' },
    { key: "cancellations", label: 'סה"כ ביטולים' }
];

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

    useEffect(() => {
        let cancelled = false;

        async function loadStatistics() {
            setLoading(true);
            setError("");

            try {
                const data = await fetchStaffStatistics();

                if (!cancelled) {
                    setStats(data);
                }
            } catch (loadError) {
                console.error(loadError);

                if (!cancelled) {
                    setError(
                        "לא ניתן לטעון את הנתונים כרגע. נסו לרענן את העמוד."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadStatistics();

        return () => {
            cancelled = true;
        };
    }, []);

    const hasProgramData = (stats?.registrationsByProgram?.length ?? 0) > 0;

    const pieData = useMemo(
        () =>
            (stats?.registrationsByProgram ?? []).map((item) => ({
                name: item.label,
                value: item.count
            })),
        [stats]
    );

    return (
        <div className="staff-statistics-page" dir="rtl">
            <header className="staff-statistics-header">
                <div className="staff-statistics-header__intro">
                    <h1 className="staff-statistics-header__title">סטטיסטיקות</h1>
                    <p className="staff-statistics-header__subtitle">
                        סקירה כללית של פעילות העמותה והרשמות המשתתפים
                    </p>
                </div>
                {onBack ? (
                    <button
                        type="button"
                        className="staff-statistics-back"
                        onClick={onBack}
                    >
                        ← חזרה ללוח הבקרה
                    </button>
                ) : null}
            </header>

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
                <div className="staff-statistics-content">
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

                    <section className="staff-statistics-highlight-card">
                        {stats.mostPopularActivity ? (
                            <>
                                <div className="staff-statistics-highlight-card__content">
                                    <p className="staff-statistics-highlight-card__title">
                                        הפעילות הפופולרית ביותר
                                    </p>
                                    <strong className="staff-statistics-highlight-card__name">
                                        {stats.mostPopularActivity.name}
                                    </strong>
                                    <span className="staff-statistics-highlight-card__meta">
                                        {formatCount(stats.mostPopularActivity.count)}{" "}
                                        הרשמות
                                    </span>
                                </div>
                                <span className="staff-statistics-badge">
                                    הכי מבוקשת
                                </span>
                            </>
                        ) : (
                            <div className="staff-statistics-highlight-card__content">
                                <p className="staff-statistics-highlight-card__title">
                                    הפעילות הפופולרית ביותר
                                </p>
                                <p className="staff-statistics-empty">
                                    אין נתונים להצגה
                                </p>
                            </div>
                        )}
                    </section>

                    <div className="staff-statistics-charts-grid staff-statistics-charts-grid--middle">
                        <section className="staff-statistics-card">
                            <h2 className="staff-statistics-card__title">
                                הרשמות לפי תוכנית
                            </h2>
                            {hasProgramData ? (
                                <div className="staff-statistics-chart">
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="46%"
                                                innerRadius={52}
                                                outerRadius={88}
                                                paddingAngle={2}
                                                stroke="#ffffff"
                                                strokeWidth={2}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={
                                                            CHART_COLORS[
                                                                index %
                                                                    CHART_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<StatisticsTooltip />} />
                                            <Legend
                                                verticalAlign="bottom"
                                                iconType="circle"
                                                iconSize={8}
                                                wrapperStyle={{
                                                    fontSize: 11,
                                                    paddingTop: 0
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="staff-statistics-empty">
                                    אין נתונים להצגה
                                </p>
                            )}
                        </section>

                        <section className="staff-statistics-card">
                            <h2 className="staff-statistics-card__title">
                                הרשמות לפי פעילות
                            </h2>
                            {stats.topActivitiesByRegistrations.length > 0 ? (
                                <div className="staff-statistics-chart">
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart
                                            data={stats.topActivitiesByRegistrations}
                                            layout="vertical"
                                            margin={{
                                                top: 4,
                                                right: 20,
                                                left: 4,
                                                bottom: 4
                                            }}
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
                                                tick={{ fontSize: 11, fill: "#6B7280" }}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={100}
                                                tick={{ fontSize: 11, fill: "#6B7280" }}
                                            />
                                            <Tooltip content={<StatisticsTooltip />} />
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
                            ) : (
                                <p className="staff-statistics-empty">
                                    אין נתונים להצגה
                                </p>
                            )}
                        </section>
                    </div>

                    <div className="staff-statistics-charts-grid staff-statistics-charts-grid--bottom">
                        <section className="staff-statistics-card">
                            <h2 className="staff-statistics-card__title">
                                הרשמות לפי חודש
                            </h2>
                            {stats.monthlyRegistrations.some(
                                (item) => item.count > 0
                            ) ? (
                                <div className="staff-statistics-chart">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart
                                            data={stats.monthlyRegistrations}
                                            margin={{
                                                top: 8,
                                                right: 12,
                                                left: 4,
                                                bottom: 4
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#E8F5E9"
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fontSize: 11, fill: "#6B7280" }}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 11, fill: "#6B7280" }}
                                            />
                                            <Tooltip content={<StatisticsTooltip />} />
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

                        <section className="staff-statistics-card">
                            <h2 className="staff-statistics-card__title">
                                ביטולים לפי פעילות
                            </h2>
                            {stats.cancellationsByActivity.length > 0 ? (
                                <div className="staff-statistics-table-wrap">
                                    <table className="staff-statistics-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">פעילות</th>
                                                <th scope="col">מספר ביטולים</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.cancellationsByActivity.map((row) => (
                                                <tr key={`${row.id}-${row.name}`}>
                                                    <td>{row.name}</td>
                                                    <td>{formatCount(row.count)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="staff-statistics-empty">
                                    אין ביטולים נוספים
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default StaffStatistics;
