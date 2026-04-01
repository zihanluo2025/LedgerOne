"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { KpiItem } from "@/lib/dashboard/mock";

const trendClasses: Record<KpiItem["trendType"], string> = {
    positive:
        "bg-emerald-50 text-emerald-700",
    neutral:
        " bg-slate-50 text-slate-600",
    warning:
        " bg-amber-50 text-amber-700",
};



// const progressClasses: Record<KpiItem["trendType"], string> = {
//     positive: "bg-emerald-100",
//     neutral: "bg-slate-200",
//     warning: "bg-amber-500",
// };

export default function KpiGrid({ items }: { items: KpiItem[] }) {
    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {items.map((kpi) => (
                <Card
                    key={kpi.label}
                    className="rounded-l  bg-white shadow-none"
                >
                    <CardContent className="flex h-full flex-col p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <Image
                                    src={kpi.iconSrc}
                                    alt={kpi.label}
                                    width={24}
                                    height={24}
                                    className="h-10 w-10"
                                />
                            </div>

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
                            <p className="text-[16px] font-medium text-[#5f7190]">
                                {kpi.label}
                            </p>

                            <p className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-[#0f172a]">
                                {kpi.displayValue}
                            </p>
                        </div>

                        <div className="mt-6 space-y-3">
                            {/* <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#e8edf5]">
                                <div
                                    className={[
                                        "h-full rounded-full transition-all duration-300",
                                        progressClasses[kpi.trendType],
                                    ].join(" ")}
                                    style={{ width: `${kpi.progress}%` }}
                                />
                            </div> */}

                            <p className="text-[14px] leading-6 text-[#74839b]">
                                {kpi.subText}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}