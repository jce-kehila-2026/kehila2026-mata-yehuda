import { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    getDonationChartTitle,
    getDonationStatistics
} from "../../services/donationService";

const CHART_COLOR = "#2E7D32";

function formatCurrency(value) {
    return new Intl.NumberFormat("he-IL", {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 0
    }).format(value ?? 0);
}

function formatCount(value) {
    return new Intl.NumberFormat("he-IL").format(value ?? 0);
}

function DonationChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="donations-summary__tooltip">
            <strong>{label}</strong>
            <span>{formatCurrency(payload[0]?.value)}</span>
        </div>
    );
}

function DonationSummary({ donations = [], periodFilter }) {
    const stats = useMemo(
        () => getDonationStatistics(donations, periodFilter),
        [donations, periodFilter]
    );
    const chartTitle = useMemo(
        () => getDonationChartTitle(periodFilter),
        [periodFilter]
    );

    const summaryCards = [
        {
            id: "total",
            label: 'סה"כ תרומות',
            value: formatCurrency(stats.totalAmount)
        },
        {
            id: "monthly",
            label: "תרומות החודש",
            value: formatCurrency(stats.monthlyTotal)
        },
        {
            id: "donors",
            label: "מספר תורמים",
            value: formatCount(stats.uniqueDonors)
        },
        {
            id: "average",
            label: "ממוצע תרומה",
            value: formatCurrency(stats.averageAmount)
        },
        {
            id: "largest",
            label: "תרומה הגבוהה ביותר",
            value: formatCurrency(stats.largestDonation)
        },
        {
            id: "top-donor",
            label: "תורם מוביל",
            value:
                stats.topDonor.total > 0
                    ? `${stats.topDonor.name} (${formatCurrency(stats.topDonor.total)})`
                    : "—"
        }
    ];

    return (
        <section className="donations-summary" aria-label="סיכום תרומות">
            <div className="donations-summary__cards">
                {summaryCards.map((card) => (
                    <article key={card.id} className="donations-summary__card">
                        <span className="donations-summary__card-value">
                            {card.value}
                        </span>
                        <span className="donations-summary__card-label">
                            {card.label}
                        </span>
                    </article>
                ))}
            </div>

            <article className="donations-summary__chart-card">
                <h3 className="donations-summary__chart-title">
                    {chartTitle}
                </h3>
                <div className="donations-summary__chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats.monthlyChartData}
                            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e5e7eb"
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 12, fill: "#6b7280" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={(value) =>
                                    formatCount(value)
                                }
                                tick={{ fontSize: 12, fill: "#6b7280" }}
                                axisLine={false}
                                tickLine={false}
                                width={56}
                            />
                            <Tooltip content={<DonationChartTooltip />} />
                            <Bar
                                dataKey="amount"
                                fill={CHART_COLOR}
                                radius={[6, 6, 0, 0]}
                                maxBarSize={48}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </article>
        </section>
    );
}

export default DonationSummary;
