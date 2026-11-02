"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import DashboardHeader from "@/app/(app)/dashboard/_components/DashboardHeader";
import KpiGrid from "@/app/(app)/dashboard/_components/KpiGrid";
import SalesTrendCard from "@/app/(app)/dashboard/_components/SalesTrendCard";
import InventoryPieCard from "@/app/(app)/dashboard/_components/InventoryPieCard";
import NoticeListCard from "@/app/(app)/dashboard/_components/NoticeListCard";

import { getDashboardSummary } from "@/lib/apis/dashboard";
import { getErrorMessage } from "@/lib/api";
import { buildKpis, buildNotices } from "@/lib/dashboard/view-model";
import type { DashboardSummary } from "@/types/dashboard";

export type TrendRange = 7 | 30;

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [range, setRange] = useState<TrendRange>(7);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (days: TrendRange) => {
        setLoading(true);
        setError(null);
        try {
            setSummary(await getDashboardSummary(days));
        } catch (e) {
            setError(getErrorMessage(e, "Failed to load dashboard."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load(range);
    }, [load, range]);

    const kpis = useMemo(() => (summary ? buildKpis(summary) : []), [summary]);
    const notices = useMemo(() => (summary ? buildNotices(summary) : []), [summary]);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <DashboardHeader generatedAt={summary?.generatedAt} />

                <Button
                    variant="outline"
                    onClick={() => void load(range)}
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    Refresh
                </Button>
            </div>

            {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <KpiGrid items={kpis} loading={loading && !summary} />

            <div className="grid gap-4 xl:grid-cols-2">
                <SalesTrendCard
                    data={summary?.salesTrend ?? []}
                    currency={summary?.sales.currency ?? "AUD"}
                    range={range}
                    onRangeChange={setRange}
                    loading={loading}
                />
                <InventoryPieCard data={summary?.inventoryBreakdown ?? []} loading={loading && !summary} />
            </div>

            <NoticeListCard items={notices} loading={loading && !summary} />
        </div>
    );
}
