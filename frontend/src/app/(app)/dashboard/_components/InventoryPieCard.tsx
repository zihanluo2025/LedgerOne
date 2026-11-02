"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { PIE_COLORS, PIE_OTHERS_COLOR } from "@/lib/dashboard/view-model";

type InventoryItem = {
    name: string;
    value: number;
};

type InventoryBreakdownCardProps = {
    data: InventoryItem[];
    loading?: boolean;
};

// Color follows the slice identity in fixed order; the "Others" bucket is always neutral.
function colorFor(item: InventoryItem, index: number) {
    return item.name === "Others" ? PIE_OTHERS_COLOR : PIE_COLORS[index % PIE_COLORS.length];
}

export default function InventoryBreakdownCard({ data, loading }: InventoryBreakdownCardProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card className="rounded-lg bg-white shadow-none">
            <CardContent className="p-6">
                <div className="mb-6 space-y-1">
                    <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                        Inventory Breakdown
                    </h3>
                    <p className="text-[14px] text-[#6e7f99]">On-hand units by product (top 5)</p>
                </div>

                {loading ? (
                    <div className="mx-auto h-[260px] w-[260px] animate-pulse rounded-full bg-slate-100" />
                ) : total === 0 ? (
                    <div className="flex h-[260px] items-center justify-center text-sm text-[#8a9ab2]">
                        No stock on hand yet. Add products to see the breakdown.
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        formatter={(value) => [`${Number(value).toLocaleString()} units`, "Stock"]}
                                        contentStyle={{
                                            borderRadius: "14px",
                                            border: "1px solid #e2e8f0",
                                            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                                            backgroundColor: "#ffffff",
                                            fontSize: "13px",
                                        }}
                                    />

                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={72}
                                        outerRadius={102}
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={entry.name} fill={colorFor(entry, index)} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-[44px] font-semibold leading-none tracking-[-0.03em] text-[#163d73]">
                                    {total.toLocaleString()}
                                </div>
                                <div className="mt-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[#8a9ab2]">
                                    Total Units
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            {data.map((item, index) => {
                                const percent = Math.round((item.value / total) * 100);

                                return (
                                    <div key={item.name} className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: colorFor(item, index) }}
                                            />
                                            <span className="text-[14px] text-[#5f7190]">{item.name}</span>
                                        </div>

                                        <span className="text-[14px] font-medium text-[#7b8ba5]">
                                            {item.value.toLocaleString()} · {percent}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
