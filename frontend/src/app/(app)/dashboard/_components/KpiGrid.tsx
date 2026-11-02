"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { KpiItem } from "@/lib/dashboard/view-model";

const trendClasses: Record<KpiItem["trendType"], string> = {
    positive: "bg-emerald-50 text-emerald-700",
    neutral: "bg-slate-50 text-slate-600",
    warning: "bg-amber-50 text-amber-700",
};

function KpiSkeleton() {
    return (
        <Card className="rounded-l bg-white shadow-none">
            <CardContent className="flex h-full animate-pulse flex-col gap-6 p-6">
                <div className="h-10 w-10 rounded-lg bg-slate-100" />
                <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-slate-100" />
                    <div className="h-8 w-32 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-40 rounded bg-slate-100" />
            </CardContent>
        </Card>
    );
}

export default function KpiGrid({ items, loading }: { items: KpiItem[]; loading?: boolean }) {
    if (loading) {
        return (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <KpiSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {items.map((kpi) => (
                <Card key={kpi.label} className="rounded-l bg-white shadow-none">
                    <CardContent className="flex h-full flex-col p-6">
                        <div className="flex items-start justify-between gap-4">
                            <Image
                                src={kpi.iconSrc}
                                alt={kpi.label}
                                width={24}
                                height={24}
                                className="h-10 w-10"
                            />

                            <div
                                className={[
                                    "inline-flex min-h-9 items-center rounded-xl px-3 py-1 text-[12px] font-semibold",
                                    trendClasses[kpi.trendType],
                                ].join(" ")}
                            >
                                {kpi.trend}
                            </div>
                        </div>

                        <div className="mt-6 space-y-1.5">
                            <p className="text-[16px] font-medium text-[#5f7190]">{kpi.label}</p>

                            <p className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-[#0f172a]">
                                {kpi.displayValue}
                            </p>
                        </div>

                        <p className="mt-6 text-[14px] leading-6 text-[#74839b]">{kpi.subText}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
