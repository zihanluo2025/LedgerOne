"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { KpiItem } from "@/lib/dashboard/mock";

const trendClasses: Record<KpiItem["trendType"], string> = {
    positive: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    neutral: "bg-slate-50 text-slate-600 border border-slate-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
};

const iconWrapperClasses: Record<KpiItem["trendType"], string> = {
    positive: "bg-emerald-50 text-emerald-600",
    neutral: "bg-slate-100 text-slate-700",
    warning: "bg-amber-50 text-amber-600",
};

const progressClasses: Record<KpiItem["trendType"], string> = {
    positive: "bg-emerald-500",
    neutral: "bg-slate-400",
    warning: "bg-amber-500",
};

/**
 * KPI cards grid for ERP dashboard.
 */
export default function KpiGrid({ items }: { items: KpiItem[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((kpi) => (
                <Card
                    key={kpi.label}
                    className="erp-card border border-[var(--erp-border)] bg-[var(--erp-surface)] shadow-none"
                >
                    <CardContent className="p-6">
                        <div className="flex h-full flex-col gap-5">
                            <div className="flex items-start justify-between gap-3">
                                <div
                                    className={[
                                        "flex h-12 w-12 items-center justify-center rounded-xl text-xl",
                                        iconWrapperClasses[kpi.trendType],
                                    ].join(" ")}
                                >
                                    {kpi.icon}
                                </div>

                                <div
                                    className={[
                                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                                        trendClasses[kpi.trendType],
                                    ].join(" ")}
                                >
                                    {kpi.trend}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-base font-medium text-[var(--erp-text-secondary)]">
                                    {kpi.label}
                                </p>
                                <p className="text-4xl font-bold tracking-tight text-[var(--erp-text)]">
                                    {kpi.displayValue}
                                </p>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={[
                                            "h-full rounded-full transition-all",
                                            progressClasses[kpi.trendType],
                                        ].join(" ")}
                                        style={{ width: `${kpi.progress}%` }}
                                    />
                                </div>

                                <p className="text-sm text-[var(--erp-text-muted)]">
                                    {kpi.subText}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}