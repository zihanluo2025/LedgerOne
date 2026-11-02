"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/dashboard/view-model";
import type { DashboardSummary } from "@/types/dashboard";

type SalesTrendItem = DashboardSummary["salesTrend"][number];

type SalesTrendCardProps = {
    data: SalesTrendItem[];
    currency: string;
    range: 7 | 30;
    onRangeChange: (range: 7 | 30) => void;
    loading?: boolean;
};

const RANGES: { value: 7 | 30; label: string }[] = [
    { value: 7, label: "7 Days" },
    { value: 30, label: "30 Days" },
];

export default function SalesTrendCard({ data, currency, range, onRangeChange, loading }: SalesTrendCardProps) {
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    const orders = data.reduce((sum, d) => sum + d.orders, 0);

    return (
        <Card className="rounded-l bg-white shadow-none">
            <CardContent className="p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                            Sales Trend
                        </h3>
                        <p className="text-[14px] text-[#6e7f99]">
                            {formatMoney(total, currency)} from {orders} orders in the last {range} days
                            (excludes cancelled)
                        </p>
                    </div>

                    <div className="inline-flex rounded-xl border border-[#dbe4f0] bg-[#f5f8fc] p-1">
                        {RANGES.map((r) => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => onRangeChange(r.value)}
                                className={[
                                    "h-8 whitespace-nowrap rounded-lg px-3 text-[13px] font-medium transition",
                                    r.value === range
                                        ? "bg-white text-[#163d73] shadow-sm"
                                        : "text-[#6e7f99] hover:text-[#163d73]",
                                ].join(" ")}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={["h-[320px] w-full transition-opacity", loading ? "opacity-50" : ""].join(" ")}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#2a78d6" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} stroke="#edf2f8" />

                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                                minTickGap={24}
                                tick={{ fill: "#95a3ba", fontSize: 12 }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                width={56}
                                allowDecimals={false}
                                tickFormatter={(v: number) => formatMoney(v, currency, true)}
                                tick={{ fill: "#95a3ba", fontSize: 12 }}
                            />

                            <Tooltip
                                cursor={{ stroke: "#d9e4f2", strokeWidth: 1 }}
                                contentStyle={{
                                    borderRadius: 14,
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                                    backgroundColor: "#ffffff",
                                    fontSize: "13px",
                                }}
                                labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
                                formatter={(value, _name, item) => [
                                    `${formatMoney(Number(value), currency)} · ${item.payload.orders} orders`,
                                    "Revenue",
                                ]}
                            />

                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#2a78d6"
                                strokeWidth={2}
                                fill="url(#salesTrendFill)"
                                dot={range === 7 ? { r: 4, strokeWidth: 2, fill: "#ffffff", stroke: "#2a78d6" } : false}
                                activeDot={{ r: 5, strokeWidth: 2, fill: "#ffffff", stroke: "#2a78d6" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
