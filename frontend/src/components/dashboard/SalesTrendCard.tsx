"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type SalesTrendItem = {
    day: string;
    amount: number;
};

type SalesTrendCardProps = {
    data: SalesTrendItem[];
};

export default function SalesTrendCard({ data }: SalesTrendCardProps) {
    return (
        <Card className="rounded-l  bg-white shadow-none">
            <CardContent className="p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                            Weekly Sales Trend
                        </h3>
                        <p className="text-[14px] text-[#6e7f99]">
                            Performance metrics across the last 7 cycles
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dbe4f0] bg-[#f5f8fc] px-4 text-[14px] font-medium text-[#2f5d9b] transition hover:bg-[#eef4fb]"
                    >
                        <span>Last 7 Days</span>
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>

                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6da7ff" stopOpacity={0.22} />
                                    <stop offset="100%" stopColor="#6da7ff" stopOpacity={0.03} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                stroke="#edf2f8"
                                strokeDasharray="0"
                            />

                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
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
                            />

                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#4a84c5"
                                strokeWidth={2}
                                fill="url(#salesTrendFill)"
                                dot={{
                                    r: 1.5,
                                    strokeWidth: 2,
                                    fill: "#ffffff",
                                    stroke: "#4a84c5",
                                }}
                                activeDot={{
                                    r: 5,
                                    strokeWidth: 2,
                                    fill: "#ffffff",
                                    stroke: "#4a84c5",
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}